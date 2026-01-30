const httpStatus = require('http-status');
const { InventoryTransaction, ProductBatch } = require('../models');
const ApiError = require('../utils/ApiError');

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
  const inventoryTransactions = await InventoryTransaction.paginate(filter, options);
  return inventoryTransactions;
};

/**
 * Get inventoryTransaction by id
 * @param {ObjectId} id
 * @returns {Promise<InventoryTransaction>}
 */
const getInventoryTransactionById = async (id) => {
  return InventoryTransaction.findById(id);
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
 * @param {Object} inventoryTransactionBody
 * @param {Object} req
 * @returns {Promise<void>}
 */
const importInventory = async (inventoryTransactionBody, req) => {
  const { warehouse, supplier, items } = inventoryTransactionBody;

  const batches = await Promise.all(
    items.map(async (item) => {
      const batch = await ProductBatch.create({
        product: item.product,
        warehouse,
        batchCode: item.batchCode,
        manufactureDate: item.manufactureDate,
        expiryDate: item.expiryDate,
        quantity: item.quantity,
        importPrice: item.price,
      });

      return {
        product: item.product,
        batch: batch._id,
        quantity: item.quantity,
        price: item.price,
      };
    })
  );

  const transaction = await InventoryTransaction.create({
    type: 'IMPORT',
    reason: 'PURCHASE',
    warehouse,
    supplier,
    createdBy: req.user.id,
    items: batches,
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
