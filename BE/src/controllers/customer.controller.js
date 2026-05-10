const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { customerService } = require('../services');
const responseMessages = require('../constants/responseMessages');
const { buildScopeContext } = require('../utils/branchScope');

const createCustomer = catchAsync(async (req, res) => {
  if (req.isSuperAdmin) {
    throw new ApiError(httpStatus.FORBIDDEN, responseMessages.common.forbidden);
  }
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
    throw new ApiError(httpStatus.NOT_FOUND, responseMessages.customer.notFound);
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

/**
 * GET /customers/import-template
 * Download a pre-filled Excel template for customer import.
 */
const getImportTemplate = catchAsync(async (req, res) => {
  const buffer = await customerService.getCustomerImportTemplate();
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="customer_import_template.xlsx"');
  res.send(buffer);
});

/**
 * POST /customers/import
 * Import customers from an uploaded Excel file.
 */
const importCustomers = catchAsync(async (req, res) => {
  if (req.isSuperAdmin) {
    throw new ApiError(httpStatus.FORBIDDEN, responseMessages.common.forbidden);
  }
  if (!req.file) {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessages.customer.excel.invalidFile);
  }
  const scopeContext = buildScopeContext(req);
  const result = await customerService.importCustomersFromExcel(req.file.buffer, scopeContext, req.body.branch);
  res.status(httpStatus.OK).send(result);
});

/**
 * GET /customers/export
 * Export customer list as an Excel file download.
 */
const exportCustomers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'phone', 'email', 'address']);
  const scopeContext = buildScopeContext(req);
  const buffer = await customerService.exportCustomersToExcel(filter, scopeContext);

  const filename = `customers_${Date.now()}.xlsx`;
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(buffer);
});

module.exports = {
  createCustomer,
  getCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  getImportTemplate,
  importCustomers,
  exportCustomers,
};
