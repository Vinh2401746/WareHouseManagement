const httpStatus = require('http-status');
const { InventoryTransaction, ProductBatch, Product } = require('../models');
const ApiError = require('../utils/ApiError');
const { INVENTORY_TRANSACTION_TYPES, INVENTORY_TRANSACTION_REASONS } = require('../constants/inventoryTransaction.constant');

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
    throw new ApiError(httpStatus.NOT_FOUND, 'InventoryTransaction not found');
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
    throw new ApiError(httpStatus.NOT_FOUND, 'InventoryTransaction not found');
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
  const { warehouse, supplier, items, reason, deliveryPerson } = importInventoryBody;

  const batches = await Promise.all(
    items.map(async (item) => {
      // 1. Tìm hoặc tạo sản phẩm
      let product = await Product.findOne({ code: item.productCode });
      console.log({ item });
      if (!product) {
        product = await Product.create({
          code: item.productCode,
          name: item.productName,
          unit: item.unit,
          package: item.package,
          category: item.category,
        });
      }
      console.log({ product });
      const batchCode = `B${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random()
        .toString(36)
        .slice(2, 8)
        .toUpperCase()}`;

      // 2. Tạo batch cho sản phẩm
      const batch = await ProductBatch.create({
        product: product._id,
        batchCode,
        warehouse,
        expiryDate: item.expiryDate,
        quantity: item.quantity,
        importPrice: item.price,
        reason: reason || INVENTORY_TRANSACTION_REASONS.PURCHASE,
      });

      // 3. Ghi vào danh sách transaction
      return {
        product: product._id,
        batch: batch._id,
        quantity: item.quantity,
        price: item.price,
      };
    })
  );

  const transaction = await InventoryTransaction.create({
    type: INVENTORY_TRANSACTION_TYPES.IMPORT,
    reason: importInventoryBody.reason || INVENTORY_TRANSACTION_REASONS.PURCHASE,
    warehouse,
    supplier,
    createdBy: req.user.id,
    items: batches,
    deliveryPerson,
  });

  return transaction;
};

module.exports = {
  createInventoryTransaction,
  queryInventoryTransactions,
  getInventoryTransactionById,
  updateInventoryTransactionById,
  deleteInventoryTransactionById,
  importInventory,
};
