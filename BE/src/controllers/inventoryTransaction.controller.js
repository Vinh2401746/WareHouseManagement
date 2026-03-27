const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { inventoryTransactionService } = require('../services');
const responseMessages = require('../constants/responseMessages');

const buildScopeContext = (req) => ({
  branch: req.user ? req.user.branch : null,
  role: req.userRole,
  isGlobalRole: req.isGlobalRole,
});

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
  const scopeContext = buildScopeContext(req);
  const result = await inventoryTransactionService.queryInventoryTransactions(filter, options, scopeContext);
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

const confirmImport = catchAsync(async (req, res) => {
  const result = await inventoryTransactionService.confirmImport(req.params.inventoryTransactionId);
  res.send(result);
});

const cancelImport = catchAsync(async (req, res) => {
  const result = await inventoryTransactionService.cancelImport(req.params.inventoryTransactionId, req.body.cancelReason);
  res.send(result);
});

const changeImportStatus = catchAsync(async (req, res) => {
  const result = await inventoryTransactionService.changeImportStatus(req.params.inventoryTransactionId, req.body.status);
  res.send(result);
});

module.exports = {
  createInventoryTransaction,
  getInventoryTransactions,
  getInventoryTransaction,
  updateInventoryTransaction,
  deleteInventoryTransaction,
  importInventory,
  confirmImport,
  cancelImport,
  changeImportStatus,
};
