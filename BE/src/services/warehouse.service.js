const httpStatus = require('http-status');
const { Warehouse } = require('../models');
const ApiError = require('../utils/ApiError');
const responseMessages = require('../constants/responseMessages');
const { applyBranchScope } = require('../utils/branchScope');

/**
 * Create a warehouse
 * @param {Object} warehouseBody
 * @returns {Promise<Warehouse>}
 */
const createWarehouse = async (warehouseBody) => {
  const warehouse = await Warehouse.create(warehouseBody);
  return warehouse;
};

/**
 * Query for warehouses
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryWarehouses = async (filter, options, context = {}) => {
  const scopedFilter = applyBranchScope(filter, context);
  const queryOptions = { ...options, populate: 'branch' };
  const warehouses = await Warehouse.paginate(scopedFilter, queryOptions);
  return warehouses;
};

/**
 * Get warehouse by id
 * @param {ObjectId} id
 * @returns {Promise<Warehouse>}
 */
const getWarehouseById = async (id) => {
  return Warehouse.findById(id).populate('branch');
};

/**
 * Update warehouse by id
 * @param {ObjectId} warehouseId
 * @param {Object} updateBody
 * @returns {Promise<Warehouse>}
 */
const updateWarehouseById = async (warehouseId, updateBody) => {
  const warehouse = await getWarehouseById(warehouseId);
  if (!warehouse) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessages.warehouse.notFound);
  }
  Object.assign(warehouse, updateBody);
  await warehouse.save();
  return warehouse;
};

/**
 * Delete warehouse by id
 * @param {ObjectId} warehouseId
 * @returns {Promise<Warehouse>}
 */
const deleteWarehouseById = async (warehouseId) => {
  const warehouse = await getWarehouseById(warehouseId);
  if (!warehouse) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessages.warehouse.notFound);
  }
  await warehouse.remove();
  return warehouse;
};

module.exports = {
  createWarehouse,
  queryWarehouses,
  getWarehouseById,
  updateWarehouseById,
  deleteWarehouseById,
};
