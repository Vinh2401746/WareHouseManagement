const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { branchService } = require('../services');
const responseMessages = require('../constants/responseMessages');
const { buildScopeContext, extractId } = require('../utils/branchScope');

const createBranch = catchAsync(async (req, res) => {
  const branch = await branchService.createBranch(req.body);
  res.status(httpStatus.CREATED).send(branch);
});

const getBranchs = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'address', 'phone']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  
  const scopeContext = buildScopeContext(req);
  if (!scopeContext.isGlobalRole) {
    const branchId = extractId(scopeContext.branch);
    if (branchId) {
      filter._id = branchId;
    } else {
      // If user is not global and has no branch, they shouldn't see any branches
      filter._id = '000000000000000000000000';
    }
  }

  const result = await branchService.queryBranchs(filter, options);
  res.send(result);
});

const getBranch = catchAsync(async (req, res) => {
  const branch = await branchService.getBranchById(req.params.branchId);
  if (!branch) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessages.branch.notFound);
  }
  res.send(branch);
});

const updateBranch = catchAsync(async (req, res) => {
  const branch = await branchService.updateBranchById(req.params.branchId, req.body);
  res.send(branch);
});

const deleteBranch = catchAsync(async (req, res) => {
  await branchService.deleteBranchById(req.params.branchId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createBranch,
  getBranchs,
  getBranch,
  updateBranch,
  deleteBranch,
};
