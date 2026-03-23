const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { productInventoryService } = require('../services');

const getInventoryOverview = catchAsync(async (req, res) => {
  const filterFields = [
    'keyword',
    'productId',
    'productIds',
    'warehouse',
    'warehouseId',
    'warehouseIds',
    'alertOnly',
    'startDate',
    'endDate',
    'dateFrom',
    'dateTo',
  ];
  const optionFields = ['sortBy', 'limit', 'page'];

  const filters = pick(req.query, filterFields);
  const options = pick(req.query, optionFields);
  const result = await productInventoryService.getInventoryOverview(filters, options);
  res.send(result);
});

const getInventoryDetail = catchAsync(async (req, res) => {
  const filterFields = ['warehouse', 'warehouseId', 'warehouseIds', 'startDate', 'endDate', 'dateFrom', 'dateTo'];
  const filters = pick(req.query, filterFields);
  const result = await productInventoryService.getInventoryDetail(req.params.productId, filters);
  res.send(result);
});

module.exports = {
  getInventoryOverview,
  getInventoryDetail,
};
