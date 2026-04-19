const httpStatus = require('http-status');
const { WarehouseTransfer, Warehouse, ProductBatch, InventoryTransaction } = require('../models');
const ApiError = require('../utils/ApiError');
const responseMessages = require('../constants/responseMessages');
const inventoryTransactionService = require('./inventoryTransaction.service');
const { resolveScopedWarehouseIds, extractId } = require('../utils/branchScope');

const STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  CANCELED: 'CANCELED',
};

const isGlobalScope = (context = {}) => Boolean(context.isGlobalRole) || (context.role && context.role.scope === 'global');

const buildTransferCode = async (transactionDate) => {
  const prefix = 'LC';
  const dateObj = transactionDate ? new Date(transactionDate) : new Date();
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  const dateText = `${yyyy}${mm}${dd}`;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const rand = Math.floor(1000 + Math.random() * 9000);
    const code = `${prefix}-${dateText}-${rand}`;
    const exists = await WarehouseTransfer.findOne({ code }).select('_id').lean();
    if (!exists) return code;
  }

  throw new ApiError(httpStatus.CONFLICT, 'Không thể tạo mã phiếu luân chuyển.');
};

const populateWarehouseTransferQuery = (query) =>
  query
    .populate('sourceWarehouse', 'name code address branch')
    .populate('destinationWarehouse', 'name code address branch')
    .populate('createdBy', 'name email')
    .populate('approvedBy', 'name email')
    .populate('canceledBy', 'name email')
    .populate('exportTransaction', 'code status transactionDate warehouse type reason')
    .populate('importTransaction', 'code status transactionDate warehouse type reason')
    .populate({
      path: 'items.product',
      populate: { path: 'unit' },
    })
    .populate({
      path: 'items.batch',
      select: 'batchCode expiryDate productCode productName unit importPrice totalAmount warehouse',
      populate: { path: 'unit' },
    })
    .populate({
      path: 'items.allocations.sourceBatch',
      select: 'batchCode expiryDate unit importPrice warehouse',
      populate: { path: 'unit' },
    })
    .populate({
      path: 'items.allocations.destinationBatch',
      select: 'batchCode expiryDate unit importPrice warehouse',
      populate: { path: 'unit' },
    });

const mapWarehouseTransferForClient = (transfer) => {
  if (!transfer) return transfer;

  const doc = transfer.toJSON ? transfer.toJSON() : transfer;
  return {
    ...doc,
    canApprove: doc.status === STATUS.PENDING,
    canCancel: doc.status === STATUS.PENDING,
  };
};

const getPopulatedWarehouseTransferById = async (id) =>
  populateWarehouseTransferQuery(WarehouseTransfer.findById(id)).exec();

const getWarehouseTransferById = async (id) => {
  const transfer = await getPopulatedWarehouseTransferById(id);
  return mapWarehouseTransferForClient(transfer);
};

const queryWarehouseTransfers = async (filter, options, context = {}) => {
  const scopedFilter = { ...filter };

  if (!isGlobalScope(context)) {
    const allowedWarehouseIds = await resolveScopedWarehouseIds(null, context);
    const allowedSet = new Set((allowedWarehouseIds || []).map(String));

    if (scopedFilter.sourceWarehouse && !allowedSet.has(String(scopedFilter.sourceWarehouse))) {
      scopedFilter.sourceWarehouse = '000000000000000000000000';
    }

    if (scopedFilter.destinationWarehouse && !allowedSet.has(String(scopedFilter.destinationWarehouse))) {
      scopedFilter.destinationWarehouse = '000000000000000000000000';
    }

    scopedFilter.$and = (scopedFilter.$and || []).concat([
      { sourceWarehouse: { $in: allowedWarehouseIds } },
      { destinationWarehouse: { $in: allowedWarehouseIds } },
    ]);
  }

  const queryOptions = {
    ...options,
    sortBy: options && options.sortBy ? options.sortBy : '-createdAt',
    populate: '',
  };

  const result = await WarehouseTransfer.paginate(scopedFilter, queryOptions);

  const populatedResults = await Promise.all(
    (result.results || []).map(async (row) => {
      const rowId = row && (row.id || row._id);
      return mapWarehouseTransferForClient(await getPopulatedWarehouseTransferById(rowId));
    })
  );

  return {
    ...result,
    results: populatedResults,
  };
};

const assertWarehousesSameBranchAndScoped = async ({ sourceWarehouse, destinationWarehouse, context }) => {
  const src = await Warehouse.findById(sourceWarehouse).select('_id branch').lean();
  if (!src) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessages.warehouse.notFound);
  }

  const dest = await Warehouse.findById(destinationWarehouse).select('_id branch').lean();
  if (!dest) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessages.warehouse.notFound);
  }

  if (String(src._id) === String(dest._id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Kho nguồn và kho đích không được trùng nhau.');
  }

  if (src.branch && dest.branch && String(src.branch) !== String(dest.branch)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Kho nguồn và kho đích phải thuộc cùng chi nhánh.');
  }

  if (!isGlobalScope(context)) {
    const branchId = extractId(context.branch);
    if (branchId && src.branch && String(src.branch) !== String(branchId)) {
      throw new ApiError(httpStatus.FORBIDDEN, responseMessages.common.forbidden);
    }
    if (branchId && dest.branch && String(dest.branch) !== String(branchId)) {
      throw new ApiError(httpStatus.FORBIDDEN, responseMessages.common.forbidden);
    }
  }

  return { src, dest };
};

const createWarehouseTransfer = async (transferBody, req, context = {}) => {
  const { sourceWarehouse, destinationWarehouse, items, reason, note } = transferBody;

  await assertWarehousesSameBranchAndScoped({ sourceWarehouse, destinationWarehouse, context });

  const code = await buildTransferCode(new Date());

  const transfer = await WarehouseTransfer.create({
    code,
    sourceWarehouse,
    destinationWarehouse,
    reason,
    note,
    status: STATUS.PENDING,
    createdBy: req.user && req.user.id,
    items: (items || []).map((item) => ({
      product: item.product,
      batch: item.batch,
      quantity: item.quantity,
    })),
  });

  return getWarehouseTransferById(transfer.id);
};

const generateBatchCode = () =>
  `B${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

const approveWarehouseTransfer = async (transferId, req, context = {}) => {
  const transfer = await WarehouseTransfer.findById(transferId);
  if (!transfer) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy phiếu luân chuyển.');
  }

  if (transfer.status !== STATUS.PENDING) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Chỉ phiếu PENDING mới được duyệt.');
  }

  const actorId = req.user && req.user.id;
  if (actorId && transfer.createdBy && String(transfer.createdBy) === String(actorId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Người tạo phiếu không được tự duyệt.');
  }

  await assertWarehousesSameBranchAndScoped({
    sourceWarehouse: transfer.sourceWarehouse,
    destinationWarehouse: transfer.destinationWarehouse,
    context,
  });

  const now = new Date();
  const deductedBatches = [];
  const createdDestinationBatchIds = [];
  const createdInventoryTransactionIds = [];

  const exportItems = [];
  const importItems = [];
  const updatedItems = [];

  const rollback = async () => {
    for (const { batchId, quantity } of deductedBatches) {
      try {
        await ProductBatch.findByIdAndUpdate(batchId, { $inc: { quantity } });
      } catch (error) {
        // ignore rollback errors
      }
    }

    if (createdDestinationBatchIds.length > 0) {
      await ProductBatch.deleteMany({ _id: { $in: createdDestinationBatchIds } });
    }

    if (createdInventoryTransactionIds.length > 0) {
      await InventoryTransaction.deleteMany({ _id: { $in: createdInventoryTransactionIds } });
    }
  };

  try {
    for (const item of transfer.items || []) {
      const allocations = [];
      const requestedProductId = item.product;
      const requestedQty = item.quantity;

      if (!requestedProductId || !requestedQty || requestedQty <= 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Dòng hàng không hợp lệ.');
      }

      if (item.batch) {
        const batch = await ProductBatch.findOne({
          _id: item.batch,
          product: requestedProductId,
          warehouse: transfer.sourceWarehouse,
        });

        if (!batch) {
          throw new ApiError(httpStatus.NOT_FOUND, responseMessages.productBatch.notFound);
        }

        if (batch.expiryDate < now) {
          throw new ApiError(httpStatus.BAD_REQUEST, 'Lô hàng đã hết hạn.');
        }

        if (batch.quantity < requestedQty) {
          throw new ApiError(httpStatus.BAD_REQUEST, 'Không đủ tồn kho để luân chuyển.');
        }

        batch.quantity -= requestedQty;
        await batch.save();
        deductedBatches.push({ batchId: batch._id, quantity: requestedQty });

        const destinationBatch = await ProductBatch.create({
          product: batch.product,
          productCode: batch.productCode,
          productName: batch.productName,
          unit: batch.unit,
          warehouse: transfer.destinationWarehouse,
          batchCode: generateBatchCode(),
          manufactureDate: batch.manufactureDate,
          expiryDate: batch.expiryDate,
          quantity: requestedQty,
          importPrice: batch.importPrice,
          totalAmount: Math.round(requestedQty * (batch.importPrice || 0)),
        });
        createdDestinationBatchIds.push(destinationBatch._id);

        allocations.push({
          sourceBatch: batch._id,
          destinationBatch: destinationBatch._id,
          quantity: requestedQty,
          expiryDate: batch.expiryDate,
          importPrice: batch.importPrice,
        });

        exportItems.push({
          product: batch.product,
          batch: batch._id,
          quantity: requestedQty,
          price: batch.importPrice,
          totalAmount: Math.round(requestedQty * (batch.importPrice || 0)),
          costPrice: batch.importPrice,
          costTotal: Math.round(requestedQty * (batch.importPrice || 0)),
        });

        importItems.push({
          product: batch.product,
          batch: destinationBatch._id,
          quantity: requestedQty,
          price: batch.importPrice,
          totalAmount: Math.round(requestedQty * (batch.importPrice || 0)),
        });

        updatedItems.push({
          product: requestedProductId,
          batch: item.batch,
          quantity: requestedQty,
          allocations,
        });
      } else {
        let remainingQty = requestedQty;

        const batches = await ProductBatch.find({
          product: requestedProductId,
          warehouse: transfer.sourceWarehouse,
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

          const destinationBatch = await ProductBatch.create({
            product: batch.product,
            productCode: batch.productCode,
            productName: batch.productName,
            unit: batch.unit,
            warehouse: transfer.destinationWarehouse,
            batchCode: generateBatchCode(),
            manufactureDate: batch.manufactureDate,
            expiryDate: batch.expiryDate,
            quantity: usedQty,
            importPrice: batch.importPrice,
            totalAmount: Math.round(usedQty * (batch.importPrice || 0)),
          });
          createdDestinationBatchIds.push(destinationBatch._id);

          allocations.push({
            sourceBatch: batch._id,
            destinationBatch: destinationBatch._id,
            quantity: usedQty,
            expiryDate: batch.expiryDate,
            importPrice: batch.importPrice,
          });

          exportItems.push({
            product: batch.product,
            batch: batch._id,
            quantity: usedQty,
            price: batch.importPrice,
            totalAmount: Math.round(usedQty * (batch.importPrice || 0)),
            costPrice: batch.importPrice,
            costTotal: Math.round(usedQty * (batch.importPrice || 0)),
          });

          importItems.push({
            product: batch.product,
            batch: destinationBatch._id,
            quantity: usedQty,
            price: batch.importPrice,
            totalAmount: Math.round(usedQty * (batch.importPrice || 0)),
          });
        }

        if (remainingQty > 0) {
          throw new ApiError(httpStatus.BAD_REQUEST, 'Không đủ tồn kho còn hạn để luân chuyển.');
        }

        updatedItems.push({
          product: requestedProductId,
          batch: null,
          quantity: requestedQty,
          allocations,
        });
      }
    }

    const exportTransaction = await inventoryTransactionService.createInventoryTransaction({
      type: 'EXPORT',
      reason: 'Luân chuyển kho',
      warehouse: transfer.sourceWarehouse,
      createdBy: actorId,
      status: 'COMPLETED',
      transactionDate: now,
      totalAmount: exportItems.reduce((sum, it) => sum + (it.totalAmount || 0), 0),
      totalAmountAfterFax: exportItems.reduce((sum, it) => sum + (it.totalAmount || 0), 0),
      discountMoney: 0,
      taxMoney: 0,
      items: exportItems,
    });

    const importTransaction = await inventoryTransactionService.createInventoryTransaction({
      type: 'IMPORT',
      reason: 'Luân chuyển kho',
      warehouse: transfer.destinationWarehouse,
      createdBy: actorId,
      status: 'COMPLETED',
      transactionDate: now,
      totalAmount: importItems.reduce((sum, it) => sum + (it.totalAmount || 0), 0),
      totalAmountAfterFax: importItems.reduce((sum, it) => sum + (it.totalAmount || 0), 0),
      discountMoney: 0,
      taxMoney: 0,
      items: importItems,
    });

    createdInventoryTransactionIds.push(exportTransaction.id);
    createdInventoryTransactionIds.push(importTransaction.id);

    transfer.status = STATUS.COMPLETED;
    transfer.approvedBy = actorId;
    transfer.approvedAt = now;
    transfer.items = updatedItems;
    transfer.exportTransaction = exportTransaction.id;
    transfer.importTransaction = importTransaction.id;

    await transfer.save();

    return getWarehouseTransferById(transfer.id);
  } catch (error) {
    await rollback();
    throw error;
  }
};

const cancelWarehouseTransfer = async (transferId, cancelReason, req, context = {}) => {
  const transfer = await WarehouseTransfer.findById(transferId);
  if (!transfer) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy phiếu luân chuyển.');
  }

  if (transfer.status !== STATUS.PENDING) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Chỉ phiếu PENDING mới được hủy.');
  }

  await assertWarehousesSameBranchAndScoped({
    sourceWarehouse: transfer.sourceWarehouse,
    destinationWarehouse: transfer.destinationWarehouse,
    context,
  });

  const actorId = req.user && req.user.id;
  const actorPermissions = Array.isArray(req.userPermissions) ? req.userPermissions : [];
  const canManage = actorPermissions.includes('manageWarehouseTransfers');

  if (!canManage && (!actorId || !transfer.createdBy || String(transfer.createdBy) !== String(actorId))) {
    throw new ApiError(httpStatus.FORBIDDEN, responseMessages.common.forbidden);
  }

  transfer.status = STATUS.CANCELED;
  transfer.canceledBy = actorId;
  transfer.canceledAt = new Date();
  transfer.cancelReason = cancelReason || '';

  await transfer.save();
  return getWarehouseTransferById(transfer.id);
};

module.exports = {
  createWarehouseTransfer,
  queryWarehouseTransfers,
  getWarehouseTransferById,
  approveWarehouseTransfer,
  cancelWarehouseTransfer,
};
