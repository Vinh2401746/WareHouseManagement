const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { saleService } = require('../services');

const createSale = catchAsync(async (req, res) => {
  const sale = await saleService.createSale(req.body);
  res.status(httpStatus.CREATED).send(sale);
});

const getSales = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['code', 'branch', 'warehouse', 'soldBy', 'saleDate', 'totalAmount', 'items']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await saleService.querySales(filter, options);
  res.send(result);
});

const getSale = catchAsync(async (req, res) => {
  const sale = await saleService.getSaleById(req.params.saleId);
  if (!sale) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sale not found');
  }
  res.send(sale);
});

const updateSale = catchAsync(async (req, res) => {
  const sale = await saleService.updateSaleById(req.params.saleId, req.body);
  res.send(sale);
});

const deleteSale = catchAsync(async (req, res) => {
  await saleService.deleteSaleById(req.params.saleId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createSale,
  getSales,
  getSale,
  updateSale,
  deleteSale,
};
