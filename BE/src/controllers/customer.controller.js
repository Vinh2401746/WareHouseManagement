const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { customerService } = require('../services');
const responseMessages = require('../constants/responseMessages');
const { buildScopeContext } = require('../utils/branchScope');

const createCustomer = catchAsync(async (req, res) => {
  const scopeContext = buildScopeContext(req);
  const customer = await customerService.createCustomer(req.body, scopeContext);
  res.status(httpStatus.CREATED).send(customer);
});

const getCustomers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'phone']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  
  if (filter.name) {
    filter.name = { $regex: filter.name, $options: 'i' };
  } else {
    delete filter.name;
  }
  
  if (filter.phone) {
    filter.phone = { $regex: filter.phone, $options: 'i' };
  } else {
    delete filter.phone;
  }

  const scopeContext = buildScopeContext(req);
  const result = await customerService.queryCustomers(filter, options, scopeContext);
  res.send(result);
});

const getCustomer = catchAsync(async (req, res) => {
  const scopeContext = buildScopeContext(req);
  const customer = await customerService.getCustomerById(req.params.customerId, scopeContext);
  if (!customer) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessages.user.notFound);
  }
  res.send(customer);
});

const updateCustomer = catchAsync(async (req, res) => {
  const scopeContext = buildScopeContext(req);
  const customer = await customerService.updateCustomerById(req.params.customerId, req.body, scopeContext);
  res.send(customer);
});

const deleteCustomer = catchAsync(async (req, res) => {
  const scopeContext = buildScopeContext(req);
  await customerService.deleteCustomerById(req.params.customerId, scopeContext);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createCustomer,
  getCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
};
