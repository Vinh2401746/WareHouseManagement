const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { inventoryTransactionService } = require('../services');
const responseMessages = require('../constants/responseMessages');

const createInventoryTransaction = catchAsync(async (req, res) => {
  const inventoryTransaction = await inventoryTransactionService.createInventoryTransaction(req.body);
  res.status(httpStatus.CREATED).send(inventoryTransaction);
});

const getInventoryTransactions = catchAsync(async (req, res) => {
  const filter = pick(req.query, [
    'type',
    'reason',
    'warehouse',
    'supplier',
    'sale',
    'createdBy',
    'transactionDate',
    'deliveryPerson',
  ]);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await inventoryTransactionService.queryInventoryTransactions(filter, options);
  res.send(result);
});

const getInventoryTransaction = catchAsync(async (req, res) => {
  const inventoryTransaction = await inventoryTransactionService.getInventoryTransactionById(
    req.params.inventoryTransactionId
  );
  if (!inventoryTransaction) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessages.inventory.notFound);
  }
  res.send(inventoryTransaction);
});

const updateInventoryTransaction = catchAsync(async (req, res) => {
  const inventoryTransaction = await inventoryTransactionService.updateInventoryTransactionById(
    req.params.inventoryTransactionId,
    req.body
  );
  res.send(inventoryTransaction);
});

const deleteInventoryTransaction = catchAsync(async (req, res) => {
  await inventoryTransactionService.deleteInventoryTransactionById(req.params.inventoryTransactionId);
  res.status(httpStatus.NO_CONTENT).send();
});

// business funct
/**
 * Import inventory
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<void>}
 */
const importInventory = catchAsync(async (req, res) => {
  const inventoryTransaction = await inventoryTransactionService.importInventory(req.body, req);
  res.status(httpStatus.CREATED).send(inventoryTransaction);
});

module.exports = {
  createInventoryTransaction,
  getInventoryTransactions,
  getInventoryTransaction,
  updateInventoryTransaction,
  deleteInventoryTransaction,
  importInventory,
};
