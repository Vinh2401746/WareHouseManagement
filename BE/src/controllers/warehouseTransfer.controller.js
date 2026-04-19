const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { warehouseTransferService } = require('../services');
const { buildScopeContext } = require('../utils/branchScope');

const createWarehouseTransfer = catchAsync(async (req, res) => {
  const scopeContext = buildScopeContext(req);
  const transfer = await warehouseTransferService.createWarehouseTransfer(req.body, req, scopeContext);
  res.status(httpStatus.CREATED).send(transfer);
});

const getWarehouseTransfers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['status', 'sourceWarehouse', 'destinationWarehouse', 'code', 'createdBy']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const scopeContext = buildScopeContext(req);
  const result = await warehouseTransferService.queryWarehouseTransfers(filter, options, scopeContext);
  res.send(result);
});

const getWarehouseTransfer = catchAsync(async (req, res) => {
  const transfer = await warehouseTransferService.getWarehouseTransferById(req.params.warehouseTransferId);
  if (!transfer) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy phiếu luân chuyển.');
  }
  res.send(transfer);
});

const approveWarehouseTransfer = catchAsync(async (req, res) => {
  const scopeContext = buildScopeContext(req);
  const transfer = await warehouseTransferService.approveWarehouseTransfer(
    req.params.warehouseTransferId,
    req,
    scopeContext
  );
  res.send(transfer);
});

const cancelWarehouseTransfer = catchAsync(async (req, res) => {
  const scopeContext = buildScopeContext(req);
  const transfer = await warehouseTransferService.cancelWarehouseTransfer(
    req.params.warehouseTransferId,
    req.body && req.body.cancelReason,
    req,
    scopeContext
  );
  res.send(transfer);
});

module.exports = {
  createWarehouseTransfer,
  getWarehouseTransfers,
  getWarehouseTransfer,
  approveWarehouseTransfer,
  cancelWarehouseTransfer,
};
