const httpStatus = require('http-status');
const { InventoryTransaction, ProductBatch, Product } = require('../models');
const ApiError = require('../utils/ApiError');
const { INVENTORY_TRANSACTION_TYPES, INVENTORY_TRANSACTION_REASONS } = require('../constants/inventoryTransaction.constant');
const responseMessages = require('../constants/responseMessages');

const populateInventoryTransactionQuery = (query) =>
  query
    .populate('warehouse', 'name code address')
    .populate('supplier', 'name code phone email')
    .populate('sale', 'code totalAmount')
    .populate('createdBy', 'name email')
    .populate({
      path: 'items.product',
      populate: {
        path: 'unit',
      },
    })
    .populate({
      path: 'items.batch',
      select: 'batchCode expiryDate productCode productName unit importPrice taxRate discountRate totalAmount',
      populate: {
        path: 'unit',
      },
    });

const mapInventoryTransactionForClient = (inventoryTransaction) => {
  if (!inventoryTransaction) {
    return inventoryTransaction;
  }

  const transaction = inventoryTransaction.toJSON ? inventoryTransaction.toJSON() : inventoryTransaction;
  const items = Array.isArray(transaction.items)
    ? transaction.items.map((item) => {
        const product = item.product && typeof item.product === 'object' ? item.product : null;
        const batch = item.batch && typeof item.batch === 'object' ? item.batch : null;
        const unit = (product && product.unit) || (batch && batch.unit) || null;

        return {
          ...item,
          product,
          batch,
          productCode: (product && product.code) || (batch && batch.productCode) || '',
          productName: (product && product.name) || (batch && batch.productName) || '',
          unit,
          batchCode: (batch && batch.batchCode) || '',
          expiryDate: (batch && batch.expiryDate) || null,
          taxRate: (batch && typeof batch.taxRate === 'number' ? batch.taxRate : 0) || 0,
          discountRate: (batch && typeof batch.discountRate === 'number' ? batch.discountRate : 0) || 0,
          totalAmount:
            typeof item.totalAmount === 'number'
              ? item.totalAmount
              : (batch && typeof batch.totalAmount === 'number' ? batch.totalAmount : 0) || 0,
        };
      })
    : [];

  return {
    ...transaction,
    items,
    itemCount: items.length,
    canUpdate: transaction.status === 'PENDING',
    canConfirm: transaction.status === 'PENDING',
  };
};

const getPopulatedInventoryTransactionById = async (id) =>
  populateInventoryTransactionQuery(InventoryTransaction.findById(id)).exec();

const createOrUpdateProductForImportItem = async (item) => {
  let product = await Product.findOne({ code: item.productCode });

  if (!product) {
    product = await Product.create({
      code: item.productCode,
      name: item.productName,
      unit: item.unit,
      package: item.packaging,
    });
    return product;
  }

  let shouldUpdateProduct = false;

  if (item.productName && product.name !== item.productName) {
    product.name = item.productName;
    shouldUpdateProduct = true;
  }

  if (item.unit && String(product.unit) !== String(item.unit)) {
    product.unit = item.unit;
    shouldUpdateProduct = true;
  }

  if (item.packaging && product.package !== item.packaging) {
    product.package = item.packaging;
    shouldUpdateProduct = true;
  }

  if (shouldUpdateProduct) {
    await product.save();
  }

  return product;
};

const buildImportTransactionItems = async (items, warehouse) =>
  Promise.all(
    items.map(async (item) => {
      const product = await createOrUpdateProductForImportItem(item);
      const batchCode = `B${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random()
        .toString(36)
        .slice(2, 8)
        .toUpperCase()}`;
      const computedLineTotalAmount = item.quantity * item.price || 0;
      const lineTotalAmount = typeof item.totalAmount === 'number' ? item.totalAmount : computedLineTotalAmount;

      const batch = await ProductBatch.create({
        product: product._id,
        productCode: item.productCode,
        productName: item.productName,
        unit: item.unit,
        batchCode,
        warehouse,
        expiryDate: item.expiryDate,
        quantity: item.quantity,
        importPrice: item.price,
        taxRate: typeof item.taxRate === 'number' ? item.taxRate : 0,
        discountRate: typeof item.discountRate === 'number' ? item.discountRate : 0,
        totalAmount: lineTotalAmount,
      });

      return {
        product: product._id,
        batch: batch._id,
        quantity: item.quantity,
        price: item.price,
        totalAmount: lineTotalAmount,
      };
    })
  );

/**
 * Create a inventoryTransaction
 * @param {Object} inventoryTransactionBody
 * @returns {Promise<InventoryTransaction>}
 */
const createInventoryTransaction = async (inventoryTransactionBody) => {
  const inventoryTransaction = await InventoryTransaction.create(inventoryTransactionBody);
  return mapInventoryTransactionForClient(await getPopulatedInventoryTransactionById(inventoryTransaction.id));
};

/**
 * Query for inventoryTransactions
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryInventoryTransactions = async (filter, options) => {
  let sort = '';
  if (options.sortBy) {
    const sortingCriteria = [];
    options.sortBy.split(',').forEach((sortOption) => {
      const [key, order] = sortOption.split(':');
      sortingCriteria.push((order === 'desc' ? '-' : '') + key);
    });
    sort = sortingCriteria.join(' ');
  } else {
    sort = '-createdAt';
  }

  const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
  const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
  const skip = (page - 1) * limit;

  const countPromise = InventoryTransaction.countDocuments(filter).exec();
  const docsPromise = populateInventoryTransactionQuery(
    InventoryTransaction.find(filter).sort(sort).skip(skip).limit(limit)
  ).exec();

  const [totalResults, results] = await Promise.all([countPromise, docsPromise]);
  const totalPages = Math.ceil(totalResults / limit);

  return {
    results: results.map(mapInventoryTransactionForClient),
    page,
    limit,
    totalPages,
    totalResults,
  };
};

/**
 * Get inventoryTransaction by id
 * @param {ObjectId} id
 * @returns {Promise<InventoryTransaction>}
 */
const getInventoryTransactionById = async (id) => {
  const inventoryTransaction = await getPopulatedInventoryTransactionById(id);
  return mapInventoryTransactionForClient(inventoryTransaction);
};

/**
 * Update inventoryTransaction by id
 * @param {ObjectId} inventoryTransactionId
 * @param {Object} updateBody
 * @returns {Promise<InventoryTransaction>}
 */
const updateInventoryTransactionById = async (inventoryTransactionId, updateBody) => {
  const inventoryTransaction = await InventoryTransaction.findById(inventoryTransactionId);
  if (!inventoryTransaction) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessages.inventory.notFound);
  }

  if (inventoryTransaction.type === INVENTORY_TRANSACTION_TYPES.IMPORT) {
    if (inventoryTransaction.status !== 'PENDING') {
      throw new ApiError(httpStatus.BAD_REQUEST, responseMessages.inventory.cannotUpdateNonPending);
    }

    const newItems = await buildImportTransactionItems(updateBody.items, updateBody.warehouse);
    const oldBatchIds = inventoryTransaction.items.map((item) => item.batch).filter(Boolean);
    const newBatchIds = newItems.map((item) => item.batch).filter(Boolean);

    inventoryTransaction.reason = updateBody.reason || INVENTORY_TRANSACTION_REASONS.PURCHASE;
    inventoryTransaction.warehouse = updateBody.warehouse;
    inventoryTransaction.supplier = updateBody.supplier;
    inventoryTransaction.deliveryPerson = updateBody.deliveryPerson;
    inventoryTransaction.transactionDate = updateBody.transactionDate || inventoryTransaction.transactionDate;
    inventoryTransaction.items = newItems;
    inventoryTransaction.totalAmountAfterFax = updateBody.totalAmountAfterFax || 0;
    inventoryTransaction.discountMoney = updateBody.discountMoney || 0;
    inventoryTransaction.taxMoney = updateBody.taxMoney || 0;
    inventoryTransaction.totalAmount = updateBody.totalAmount || 0;

    try {
      await inventoryTransaction.save();
    } catch (error) {
      if (newBatchIds.length > 0) {
        await ProductBatch.deleteMany({ _id: { $in: newBatchIds } });
      }
      throw error;
    }

    if (oldBatchIds.length > 0) {
      await ProductBatch.deleteMany({ _id: { $in: oldBatchIds } });
    }

    return getInventoryTransactionById(inventoryTransactionId);
  }

  Object.assign(inventoryTransaction, updateBody);
  await inventoryTransaction.save();
  return getInventoryTransactionById(inventoryTransactionId);
};

/**
 * Delete inventoryTransaction by id
 * @param {ObjectId} inventoryTransactionId
 * @returns {Promise<InventoryTransaction>}
 */
const deleteInventoryTransactionById = async (inventoryTransactionId) => {
  const inventoryTransaction = await InventoryTransaction.findById(inventoryTransactionId);
  if (!inventoryTransaction) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessages.inventory.notFound);
  }

  // Chỉ phiếu nhập PENDING mới cho phép xóa kèm batch được tạo ra từ phiếu.
  // Với phiếu xuất hoặc phiếu nhập đã CONFIRM, batch thường là dữ liệu đang được dùng để tính tồn kho.
  if (inventoryTransaction.type === INVENTORY_TRANSACTION_TYPES.IMPORT) {
    if (inventoryTransaction.status !== 'PENDING') {
      throw new ApiError(httpStatus.BAD_REQUEST, responseMessages.inventory.cannotDeleteNonPending);
    }

    const batchIds = inventoryTransaction.items.map((item) => item.batch).filter(Boolean);
    await inventoryTransaction.remove();
    if (batchIds.length > 0) {
      await ProductBatch.deleteMany({ _id: { $in: batchIds } });
    }

    return mapInventoryTransactionForClient(inventoryTransaction);
  }

  await inventoryTransaction.remove();
  return mapInventoryTransactionForClient(inventoryTransaction);
};

/**
 * Import inventory
 * @param {Object} importInventoryBody
 * @param {Object} req
 * @returns {Promise<InventoryTransaction>}
 */
const importInventory = async (importInventoryBody, req) => {
  const { warehouse, supplier, items, reason, deliveryPerson, totalAmount, totalAmountAfterFax, discountMoney, taxMoney } =
    importInventoryBody;
  const batches = await buildImportTransactionItems(items, warehouse);

  const transaction = await InventoryTransaction.create({
    type: INVENTORY_TRANSACTION_TYPES.IMPORT,
    reason: reason || INVENTORY_TRANSACTION_REASONS.PURCHASE,
    warehouse,
    supplier,
    createdBy: req.user.id,
    items: batches,
    deliveryPerson,
    totalAmountAfterFax: totalAmountAfterFax || 0,
    discountMoney: discountMoney || 0,
    taxMoney: taxMoney || 0,
    totalAmount: totalAmount || 0,
  });

  return getInventoryTransactionById(transaction.id);
};

/**
 * Xác nhận nhập kho - chuyển PENDING -> COMPLETED
 * @param {ObjectId} transactionId
 * @returns {Promise<InventoryTransaction>}
 */
const confirmImport = async (transactionId) => {
  const transaction = await InventoryTransaction.findById(transactionId);
  if (!transaction) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessages.inventory.notFound);
  }
  if (transaction.status === 'CANCELED') {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessages.inventory.alreadyCanceled);
  }
  if (transaction.status === 'COMPLETED') {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessages.inventory.alreadyConfirmed);
  }

  transaction.status = 'COMPLETED';
  await transaction.save();
  return getInventoryTransactionById(transactionId);
};

/**
 * Hủy nhập kho - chuyển PENDING -> CANCELED, hoàn trả tồn batch
 * @param {ObjectId} transactionId
 * @param {string} [cancelReason]
 * @returns {Promise<InventoryTransaction>}
 */
const cancelImport = async (transactionId, cancelReason) => {
  const transaction = await InventoryTransaction.findById(transactionId);
  if (!transaction) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessages.inventory.notFound);
  }
  if (transaction.status === 'CANCELED') {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessages.inventory.alreadyCanceled);
  }
  if (transaction.status === 'COMPLETED') {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessages.inventory.cannotCancelCompleted);
  }

  // Hoàn trả tồn kho batch
  await Promise.all(
    transaction.items.map(async (item) => {
      if (item.batch) {
        const batch = await ProductBatch.findById(item.batch);
        if (batch) {
          batch.quantity = Math.max(0, batch.quantity - item.quantity);
          await batch.save();
        }
      }
    })
  );

  transaction.status = 'CANCELED';
  if (cancelReason) {
    transaction.reason = cancelReason;
  }
  await transaction.save();
  return getInventoryTransactionById(transactionId);
};

/**
 * Thay đổi status phiếu nhập
 * @param {ObjectId} transactionId
 * @param {string} newStatus
 * @returns {Promise<InventoryTransaction>}
 */
const changeImportStatus = async (transactionId, newStatus) => {
  const transaction = await InventoryTransaction.findById(transactionId);
  if (!transaction) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessages.inventory.notFound);
  }

  const allowedTransitions = {
    PENDING: ['COMPLETED', 'CANCELED'],
    COMPLETED: [],
    CANCELED: [],
  };

  const allowed = allowedTransitions[transaction.status] || [];
  if (!allowed.includes(newStatus)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      responseMessages.inventory.invalidStatusTransition
        .replace('{from}', transaction.status)
        .replace('{to}', newStatus)
    );
  }

  // Nếu chuyển sang CANCELED thì hoàn trả batch
  if (newStatus === 'CANCELED') {
    await Promise.all(
      transaction.items.map(async (item) => {
        if (item.batch) {
          const batch = await ProductBatch.findById(item.batch);
          if (batch) {
            batch.quantity = Math.max(0, batch.quantity - item.quantity);
            await batch.save();
          }
        }
      })
    );
  }

  transaction.status = newStatus;
  await transaction.save();
  return getInventoryTransactionById(transactionId);
};

module.exports = {
  createInventoryTransaction,
  queryInventoryTransactions,
  getInventoryTransactionById,
  updateInventoryTransactionById,
  deleteInventoryTransactionById,
  importInventory,
  confirmImport,
  cancelImport,
  changeImportStatus,
};
