const httpStatus = require('http-status');
const { Customer } = require('../models');
const ApiError = require('../utils/ApiError');
const responseMessages = require('../constants/responseMessages');
const { applyBranchScope } = require('../utils/branchScope');

/**
 * Create a customer
 * @param {Object} customerBody
 * @param {Object} context
 * @returns {Promise<Customer>}
 */
const createCustomer = async (customerBody, context = {}) => {
  // If no branch provided, inherit from request context (staff's branch)
  if (!customerBody.branch && context.branch && !context.isGlobalRole) {
    customerBody.branch = context.branch;
  }
  
  if (!customerBody.branch) {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessages.branch.required);
  }

  return Customer.create(customerBody);
};

/**
 * Query for customers
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {Object} context - Scope context
 * @returns {Promise<QueryResult>}
 */
const queryCustomers = async (filter, options, context = {}) => {
  const scopedFilter = applyBranchScope(filter, context);
  const customers = await Customer.paginate(scopedFilter, options);
  return customers;
};

/**
 * Get customer by id
 * @param {ObjectId} id
 * @param {Object} context
 * @returns {Promise<Customer>}
 */
const getCustomerById = async (id, context = {}) => {
  const scopedFilter = applyBranchScope({ _id: id }, context);
  const customer = await Customer.findOne(scopedFilter);
  return customer;
};

/**
 * Update customer by id
 * @param {ObjectId} customerId
 * @param {Object} updateBody
 * @param {Object} context
 * @returns {Promise<Customer>}
 */
const updateCustomerById = async (customerId, updateBody, context = {}) => {
  const customer = await getCustomerById(customerId, context);
  if (!customer) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessages.customer.notFound);
  }

  Object.assign(customer, updateBody);
  await customer.save();
  return customer;
};

/**
 * Delete customer by id
 * @param {ObjectId} customerId
 * @param {Object} context
 * @returns {Promise<Customer>}
 */
const deleteCustomerById = async (customerId, context = {}) => {
  const customer = await getCustomerById(customerId, context);
  if (!customer) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessages.customer.notFound);
  }

  const { Sale } = require('../models');
  const salesCount = await Sale.countDocuments({ customer: customerId });
  if (salesCount > 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessages.customer.cannotDeleteWithSales);
  }

  await customer.remove();
  return customer;
};

module.exports = {
  createCustomer,
  queryCustomers,
  getCustomerById,
  updateCustomerById,
  deleteCustomerById,
};
