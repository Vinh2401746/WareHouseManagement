const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { dashboardService } = require('../services');
const { buildScopeContext } = require('../utils/branchScope');

const getOverview = catchAsync(async (req, res) => {
  const filterFields = ['startDate', 'endDate', 'branchId', 'warehouseId'];
  const filters = pick(req.query, filterFields);
  const scopeContext = buildScopeContext(req);
  const result = await dashboardService.getOverview(filters, scopeContext);
  res.send(result);
});

module.exports = {
  getOverview,
};
