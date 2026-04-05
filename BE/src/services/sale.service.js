const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { Sale, InventoryTransaction, ProductBatch, Warehouse, Customer } = require('../models');
const ApiError = require('../utils/ApiError');
const responseMessages = require('../constants/responseMessages');
const { applyBranchScope, applyWarehouseScope } = require('../utils/branchScope');
const logger = require('../config/logger');

// Hàm gom logic làm tròn để tránh lệch tiền giữa BE và FE
const roundCurrency = (value) => Math.round(value);

// Tính tiền cho một dòng hàng hoá (giá trị gốc, chiết khấu, thuế, thành tiền)
const computeLineAmounts = (quantity, price) => {
  const baseAmount = quantity * price;
  const lineTotal = roundCurrency(baseAmount);

  return {
    baseAmount,
    discountAmount: 0,
    taxAmount: 0,
    lineTotal,
  };
};

/**
 * Create a sale
 * Xử lý tuần tự (không dùng MongoDB transaction) với rollback thủ công.
 * Lưu ý: Không đảm bảo atomic 100%, nhưng tương thích với standalone MongoDB.
 * @param {Object} saleBody
 * @param {Object} user
 * @returns {Promise<Sale>}
 */
const createSale = async (saleBody, user) => {
  const { branch, warehouse, items, customer, customerName, note, saleDate, code, status = 'COMPLETED', discountMoney = 0, taxMoney = 0, paidAmount = 0 } = saleBody;

  const warehouseDoc = await Warehouse.findById(warehouse);
  if (!warehouseDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessages.warehouse.notFound);
  }

  const resolvedBranch = branch || warehouseDoc.branch;
  if (!resolvedBranch) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessages.branch.notFound);
  }

  if (branch && warehouseDoc.branch && warehouseDoc.branch.toString() !== branch) {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessages.sale.branchWarehouseMismatch);
  }

  if (customer) {
    const customerDoc = await Customer.findById(customer);
    if (!customerDoc) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy thông tin khách hàng');
    }
  }

  const now = new Date();
  let totalAmount = 0;

  for (const item of items) {
    totalAmount += roundCurrency(item.quantity * item.price);
  }

  const totalAmountAfterFax = roundCurrency(totalAmount - discountMoney + taxMoney);
  const debtAmount = Math.max(0, totalAmountAfterFax - paidAmount);

  const salePayload = {
    code: code || `SALE-${Date.now()}`,
    status,
    branch: resolvedBranch,
    warehouse,
    soldBy: user && user.id,
    customer,
    customerName,
    note,
    totalAmount,
    discountMoney,
    taxMoney,
    totalAmountAfterFax,
    paidAmount,
    debtAmount,
    items: [],
    saleDate: saleDate || now,
  };

  // --- DRAFT: không cần trừ kho ---
  if (status === 'DRAFT') {
    for (const item of items) {
      salePayload.items.push({
        product: item.product,
        quantity: item.quantity,
        price: item.price,
        lineTotal: roundCurrency(item.quantity * item.price),
        costPrice: 0,
        costTotal: 0,
      });
    }
    return Sale.create(salePayload);
  }

  // --- COMPLETED: trừ kho tuần tự + rollback thủ công nếu lỗi ---
  const saleItems = [];
  const inventoryItems = [];
  // Ghi nhận batch đã trừ số lượng (dùng để rollback nếu bước sau lỗi)
  const deductedBatches = [];

  const registerLine = ({ product, batchId, quantity, price, costPrice }) => {
    const { lineTotal } = computeLineAmounts(quantity, price);
    const resolvedCostPrice = typeof costPrice === 'number' && !Number.isNaN(costPrice) ? costPrice : 0;
    const costTotal = roundCurrency(resolvedCostPrice * quantity);

    saleItems.push({
      product,
      batch: batchId,
      quantity,
      price,
      lineTotal,
      costPrice: resolvedCostPrice,
      costTotal,
    });

    inventoryItems.push({
      product,
      batch: batchId,
      quantity,
      price,
      totalAmount: lineTotal,
      costPrice: resolvedCostPrice,
      costTotal,
    });
  };

  /**
   * Rollback thủ công: hoàn trả số lượng đã trừ cho các batch.
   * Được gọi khi một bước sau (tạo Sale, tạo InventoryTransaction, ...) bị lỗi.
   */
  const rollbackDeductedBatches = async () => {
    for (const { batchId, quantity } of deductedBatches) {
      try {
        await ProductBatch.findByIdAndUpdate(batchId, { $inc: { quantity } });
      } catch (rollbackErr) {
        logger.error(`[Sale][Rollback] Hoàn trả batch ${batchId} (+${quantity}) thất bại: ${rollbackErr.message}`);
      }
    }
    if (deductedBatches.length > 0) {
      logger.warn(`[Sale][Rollback] Đã hoàn trả ${deductedBatches.length} batch(es) do lỗi tạo đơn`);
    }
  };

  try {
    // Bước 1: Validate nguồn hàng & trừ tồn kho từ các batch
    for (const item of items) {
      if (item.batch) {
        // Chọn lô cụ thể (FE chỉ định batch)
        const batch = await ProductBatch.findOne({
          _id: item.batch,
          product: item.product,
          warehouse,
        });

        if (!batch) {
          throw new ApiError(httpStatus.NOT_FOUND, responseMessages.productBatch.notFound);
        }
        if (batch.expiryDate < now) {
          throw new ApiError(httpStatus.BAD_REQUEST, responseMessages.sale.batchExpired);
        }
        if (batch.quantity < item.quantity) {
          throw new ApiError(httpStatus.BAD_REQUEST, responseMessages.sale.notEnoughStock);
        }

        batch.quantity -= item.quantity;
        await batch.save();
        deductedBatches.push({ batchId: batch._id, quantity: item.quantity });

        registerLine({
          product: item.product,
          batchId: batch._id,
          quantity: item.quantity,
          price: item.price,
          costPrice: batch.importPrice,
        });
      } else {
        // Tự động chọn lô theo FEFO (First Expired, First Out)
        let remainingQty = item.quantity;

        const batches = await ProductBatch.find({
          product: item.product,
          warehouse,
          quantity: { $gt: 0 },
          expiryDate: { $gte: now },
        }).sort({ expiryDate: 1, createdAt: 1 });

        for (const batch of batches) {
          if (remainingQty <= 0) break;

          const usedQty = Math.min(batch.quantity, remainingQty);
          if (usedQty <= 0) continue;

          batch.quantity -= usedQty;
          remainingQty -= usedQty;
          await batch.save();
          deductedBatches.push({ batchId: batch._id, quantity: usedQty });

          registerLine({
            product: item.product,
            batchId: batch._id,
            quantity: usedQty,
            price: item.price,
            costPrice: batch.importPrice,
          });
        }

        if (remainingQty > 0) {
          const allBatches = await ProductBatch.find({ product: item.product, warehouse, quantity: { $gt: 0 } });
          const totalPhysStock = allBatches.reduce((sum, b) => sum + b.quantity, 0);

          if (totalPhysStock >= item.quantity) {
            throw new ApiError(
              httpStatus.BAD_REQUEST,
              `Sản phẩm này có tồn kho vật lý (Tổng: ${totalPhysStock}) nhưng lượng CÒN HẠN không đủ để xuất bán (Thiếu: ${remainingQty}). Vui lòng kiểm tra lại quá trình loại bỏ lô hết hạn.`
            );
          } else {
            throw new ApiError(
              httpStatus.BAD_REQUEST,
              `Sản phẩm này không đủ tồn kho vật lý (Cần: ${item.quantity}, Có: ${totalPhysStock})`
            );
          }
        }
      }
    }

    // Bước 2: Tạo đơn bán hàng
    salePayload.items = saleItems;
    const sale = await Sale.create(salePayload);

    // Bước 3: Tạo phiếu xuất kho
    await InventoryTransaction.create({
      type: 'EXPORT',
      reason: 'SALE',
      warehouse,
      sale: sale._id,
      createdBy: user && user.id,
      status: 'COMPLETED',
      totalAmount,
      discountMoney,
      taxMoney,
      totalAmountAfterFax,
      items: inventoryItems,
    });

    // Bước 4: Cập nhật công nợ khách hàng (nếu có)
    if (customer && debtAmount > 0) {
      await Customer.findByIdAndUpdate(customer, {
        $inc: { totalDebt: debtAmount }
      });
    }

    logger.info(`[Sale] Tạo đơn thành công: ${sale.code} | warehouse=${warehouse} | items=${saleItems.length}`);
    return sale;

  } catch (error) {
    // Rollback thủ công: hoàn trả tồn kho đã trừ
    await rollbackDeductedBatches();
    throw error;
  }
};

/**
 * Query for sales
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const querySales = async (filter, options, context = {}) => {
  const branchScopedFilter = applyBranchScope(filter, context);
  const scopedFilter = await applyWarehouseScope(branchScopedFilter, context);
  const sales = await Sale.paginate(scopedFilter, options);
  return sales;
};

/**
 * Get sale by id
 * @param {ObjectId} id
 * @returns {Promise<Sale>}
 */
const getSaleById = async (id) => {
  return Sale.findById(id);
};

/**
 * Update sale by id
 * Xử lý tuần tự (không dùng MongoDB transaction).
 * @param {ObjectId} saleId
 * @param {Object} updateBody
 * @returns {Promise<Sale>}
 */
const updateSaleById = async (saleId, updateBody) => {
  const sale = await getSaleById(saleId);
  if (!sale) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessages.sale.notFound);
  }

  if (sale.status === 'COMPLETED') {
    if (updateBody.items || updateBody.status === 'DRAFT') {
      throw new ApiError(httpStatus.BAD_REQUEST, "Không thể sửa sản phẩm hoặc chuyển về trạng thái NHÁP khi đơn đã Hoàn thành. Vui lòng hủy đơn và tạo lại.");
    }

    if (updateBody.status === 'CANCELLED') {
      // Hoàn trả tồn kho (tuần tự)
      for (const item of sale.items) {
        if (item.batch) {
          await ProductBatch.findByIdAndUpdate(item.batch, {
            $inc: { quantity: item.quantity }
          });
        }
      }

      // Hoàn trả công nợ khách hàng
      if (sale.customer && sale.debtAmount > 0) {
        await Customer.findByIdAndUpdate(sale.customer, {
          $inc: { totalDebt: -sale.debtAmount }
        });
      }

      // Cập nhật InventoryTransaction thành CANCELLED
      await InventoryTransaction.findOneAndUpdate({ sale: sale._id }, { status: 'CANCELLED' });

      sale.status = 'CANCELLED';
      if (updateBody.note) sale.note = updateBody.note;
      await sale.save();

      logger.info(`[Sale] Hủy đơn thành công: ${sale.code}`);
      return sale;
    }
  }

  if (sale.status === 'DRAFT' && updateBody.status === 'COMPLETED') {
    throw new ApiError(httpStatus.BAD_REQUEST, "Không được phép chuyển trực tiếp từ NHÁP sang HOÀN THÀNH qua Update. Vui lòng xoá nháp và gọi API Tạo mới (Create Sale).");
  }

  Object.assign(sale, updateBody);
  await sale.save();
  return sale;
};

/**
 * Delete sale by id
 * Xử lý tuần tự (không dùng MongoDB transaction).
 * @param {ObjectId} saleId
 * @returns {Promise<Sale>}
 */
const deleteSaleById = async (saleId) => {
  const sale = await getSaleById(saleId);
  if (!sale) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessages.sale.notFound);
  }

  if (sale.status === 'COMPLETED') {
    // Hoàn trả tồn kho (tuần tự)
    for (const item of sale.items) {
      if (item.batch) {
        await ProductBatch.findByIdAndUpdate(item.batch, {
          $inc: { quantity: item.quantity }
        });
      }
    }

    // Hoàn trả công nợ khách hàng
    if (sale.customer && sale.debtAmount > 0) {
      await Customer.findByIdAndUpdate(sale.customer, {
        $inc: { totalDebt: -sale.debtAmount }
      });
    }

    await InventoryTransaction.findOneAndDelete({ sale: sale._id });
    await Sale.findByIdAndDelete(saleId);

    logger.info(`[Sale] Xóa đơn COMPLETED thành công: ${sale.code}`);
  } else {
    // Chỉ là Nháp hoặc Đã Hủy thì có thể xóa không lo tồn kho
    await Sale.findByIdAndDelete(saleId);
    logger.info(`[Sale] Xóa đơn ${sale.status} thành công: ${sale.code}`);
  }

  return sale;
};

module.exports = {
  createSale,
  querySales,
  getSaleById,
  updateSaleById,
  deleteSaleById,
};
