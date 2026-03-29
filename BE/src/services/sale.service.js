const httpStatus = require('http-status');
const { Sale, InventoryTransaction, ProductBatch, Warehouse } = require('../models');
const ApiError = require('../utils/ApiError');
const responseMessages = require('../constants/responseMessages');
const { applyBranchScope, applyWarehouseScope } = require('../utils/branchScope');

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
 * @param {Object} saleBody
 * @param {Object} user
 * @returns {Promise<Sale>}
 */
const createSale = async (saleBody, user) => {
  const { branch, warehouse, items, customerName, note, saleDate, code } = saleBody;
  // const warehouseDoc = await Warehouse.findById(warehouse);

  // if (!warehouseDoc) {
  //   throw new ApiError(httpStatus.NOT_FOUND, responseMessages.warehouse.notFound);
  // }

  // const resolvedBranch = branch || warehouseDoc.branch;
  // if (!resolvedBranch) {
  //   throw new ApiError(httpStatus.NOT_FOUND, responseMessages.branch.notFound);
  // }

  // if (branch && warehouseDoc.branch && warehouseDoc.branch.toString() !== branch) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, responseMessages.sale.branchWarehouseMismatch);
  // }

  const now = new Date();
  const saleItems = [];
  const inventoryItems = [];

  let totalAmount = 0;
  let discountMoney = 0;
  let taxMoney = 0;
  let totalAmountAfterFax = 0;

  const registerLine = ({ product, batchId, quantity, price, costPrice }) => {
    const { baseAmount, discountAmount, taxAmount, lineTotal } = computeLineAmounts(quantity, price);
    const resolvedCostPrice = typeof costPrice === 'number' && !Number.isNaN(costPrice) ? costPrice : 0;
    const costTotal = roundCurrency(resolvedCostPrice * quantity);

    totalAmount += baseAmount;
    discountMoney += discountAmount;
    taxMoney += taxAmount;
    totalAmountAfterFax += lineTotal;

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

  for (const item of items) {
    if (item.batch) {
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

      registerLine({
        product: item.product,
        batchId: batch._id,
        quantity: item.quantity,
        price: item.price,
        costPrice: batch.importPrice,
      });
    } else {
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
        if (usedQty <= 0) {
          continue;
        }

        batch.quantity -= usedQty;
        remainingQty -= usedQty;
        await batch.save();

        registerLine({
          product: item.product,
          batchId: batch._id,
          quantity: usedQty,
          price: item.price,
          costPrice: batch.importPrice,
        });
      }

      if (remainingQty > 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, responseMessages.sale.notEnoughStock);
      }
    }
  }

  const salePayload = {
    code: code || `SALE-${Date.now()}`,
    branch: resolvedBranch,
    warehouse,
    soldBy: user && user.id,
    customerName,
    note,
    totalAmount,
    discountMoney,
    taxMoney,
    totalAmountAfterFax,
    items: saleItems,
  };

  if (saleDate) {
    salePayload.saleDate = saleDate;
  }

  const sale = await Sale.create(salePayload);

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

  return sale;
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
 * @param {ObjectId} saleId
 * @param {Object} updateBody
 * @returns {Promise<Sale>}
 */
const updateSaleById = async (saleId, updateBody) => {
  const sale = await getSaleById(saleId);
  if (!sale) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessages.sale.notFound);
  }
  Object.assign(sale, updateBody);
  await sale.save();
  return sale;
};

/**
 * Delete sale by id
 * @param {ObjectId} saleId
 * @returns {Promise<Sale>}
 */
const deleteSaleById = async (saleId) => {
  const sale = await getSaleById(saleId);
  if (!sale) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessages.sale.notFound);
  }
  await sale.remove();
  return sale;
};

module.exports = {
  createSale,
  querySales,
  getSaleById,
  updateSaleById,
  deleteSaleById,
};
