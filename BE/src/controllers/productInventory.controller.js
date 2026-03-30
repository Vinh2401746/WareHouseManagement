const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { productInventoryService } = require('../services');

const buildScopeContext = (req) => ({
  branch: req.user ? req.user.branch : null,
  role: req.userRole,
  isGlobalRole: req.isGlobalRole,
});

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
  const scopeContext = buildScopeContext(req);
  const result = await productInventoryService.getInventoryOverview(filters, options, scopeContext);
  res.send(result);
});

const getInventoryDetail = catchAsync(async (req, res) => {
  const filterFields = ['warehouse', 'warehouseId', 'warehouseIds', 'startDate', 'endDate', 'dateFrom', 'dateTo'];
  const filters = pick(req.query, filterFields);
  const scopeContext = buildScopeContext(req);
  const result = await productInventoryService.getInventoryDetail(req.params.productId, filters, scopeContext);
  res.send(result);
});

const getProductsForPOS = catchAsync(async (req, res) => {
  const filterFields = ['keyword', 'warehouseId'];
  const optionFields = ['sortBy', 'limit', 'page'];
  
  const filters = pick(req.query, filterFields);
  const options = pick(req.query, optionFields);
  const scopeContext = buildScopeContext(req);
  
  const result = await productInventoryService.getProductsForPOS(filters, options, scopeContext);
  res.send(result);
});

module.exports = {
  getInventoryOverview,
  getInventoryDetail,
  getProductsForPOS,
};
