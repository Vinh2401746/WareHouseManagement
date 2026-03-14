const httpStatus = require('http-status');
const { InventoryTransaction, ProductBatch, Product } = require('../models');
const ApiError = require('../utils/ApiError');
const { INVENTORY_TRANSACTION_TYPES, INVENTORY_TRANSACTION_REASONS } = require('../constants/inventoryTransaction.constant');
const responseMessages = require('../constants/responseMessages');

/**
 * Create a inventoryTransaction
 * @param {Object} inventoryTransactionBody
 * @returns {Promise<InventoryTransaction>}
 */
const createInventoryTransaction = async (inventoryTransactionBody) => {
  const inventoryTransaction = await InventoryTransaction.create(inventoryTransactionBody);
  return inventoryTransaction;
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
  const docsPromise = InventoryTransaction.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('warehouse', 'name code address')
    .populate('supplier', 'name code phone email')
    .populate('sale', 'code totalAmount')
    .populate('createdBy', 'name email')
    .populate({
      path: 'items.product',
      select: 'code name unit',
    })
    .populate({
      path: 'items.batch',
      select: 'batchCode expiryDate',
    })
    .exec();

  const [totalResults, results] = await Promise.all([countPromise, docsPromise]);
  const totalPages = Math.ceil(totalResults / limit);

  return {
    results,
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
  return InventoryTransaction.findById(id)
    .populate('warehouse', 'name code address')
    .populate('supplier', 'name code phone email')
    .populate('sale', 'code totalAmount')
    .populate('createdBy', 'name email')
    .populate({
      path: 'items.product',
      select: 'code name unit',
    })
    .populate({
      path: 'items.batch',
      select: 'batchCode expiryDate',
    });
};

/**
 * Update inventoryTransaction by id
 * @param {ObjectId} inventoryTransactionId
 * @param {Object} updateBody
 * @returns {Promise<InventoryTransaction>}
 */
const updateInventoryTransactionById = async (inventoryTransactionId, updateBody) => {
  const inventoryTransaction = await getInventoryTransactionById(inventoryTransactionId);
  if (!inventoryTransaction) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessages.inventory.notFound);
  }
  Object.assign(inventoryTransaction, updateBody);
  await inventoryTransaction.save();
  return inventoryTransaction;
};

/**
 * Delete inventoryTransaction by id
 * @param {ObjectId} inventoryTransactionId
 * @returns {Promise<InventoryTransaction>}
 */
const deleteInventoryTransactionById = async (inventoryTransactionId) => {
  const inventoryTransaction = await getInventoryTransactionById(inventoryTransactionId);
  if (!inventoryTransaction) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessages.inventory.notFound);
  }
  await inventoryTransaction.remove();
  return inventoryTransaction;
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

  const batches = await Promise.all(
    items.map(async (item) => {
      // 1. Tìm hoặc tạo sản phẩm
      let product = await Product.findOne({ code: item.productCode });
      if (!product) {
        product = await Product.create({
          code: item.productCode,
          name: item.productName,
          unit: item.unit,
          // package: item.package,
        });
      }
      const batchCode = `B${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random()
        .toString(36)
        .slice(2, 8)
        .toUpperCase()}`;

      // 2. Tạo batch cho sản phẩm
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
        taxRate: item.taxRate,
        discountRate: item.discountRate,
        totalAmount: item.quantity * item.price || 0,
      });

      // 3. Ghi vào danh sách transaction
      return {
        product: product._id,
        batch: batch._id,
        quantity: item.quantity,
        price: item.price,
        totalAmount: item.quantity * item.price || 0,
      };
    })
  );

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

  return transaction;
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
