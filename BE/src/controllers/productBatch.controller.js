const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { productBatchService } = require('../services');
const responseMessages = require('../constants/responseMessages');
const { buildScopeContext } = require('../utils/branchScope');



const createProductBatch = catchAsync(async (req, res) => {
  const productBatch = await productBatchService.createProductBatch(req.body);
  res.status(httpStatus.CREATED).send(productBatch);
});

const getProductBatchs = catchAsync(async (req, res) => {
  const filter = pick(req.query, [
    'product',
    'warehouse',
    'batchCode',
    'manufactureDate',
    'expiryDate',
    'quantity',
    'importPrice',
    'keyword',
    'status',
    'stockStatus',
  ]);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const scopeContext = buildScopeContext(req);
  const result = await productBatchService.queryProductBatches(filter, options, scopeContext);
  res.send(result);
});

const getProductBatch = catchAsync(async (req, res) => {
  const productBatch = await productBatchService.getProductBatchById(req.params.productBatchId);
  if (!productBatch) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessages.productBatch.notFound);
  }
  res.send(productBatch);
});

const updateProductBatch = catchAsync(async (req, res) => {
  const productBatch = await productBatchService.updateProductBatchById(req.params.productBatchId, req.body);
  res.send(productBatch);
});

const deleteProductBatch = catchAsync(async (req, res) => {
  await productBatchService.deleteProductBatchById(req.params.productBatchId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createProductBatch,
  getProductBatchs,
  getProductBatch,
  updateProductBatch,
  deleteProductBatch,
};
