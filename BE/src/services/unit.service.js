const httpStatus = require('http-status');
const { Unit } = require('../models');
const ApiError = require('../utils/ApiError');
const responseMessages = require('../constants/responseMessages');

/**
 * Create a unit
 * @param {Object} unitBody
 * @returns {Promise<Unit>}
 */
const createUnit = async (unitBody) => {
  const unit = await Unit.create(unitBody);
  return unit;
};

/**
 * Query for units
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUnits = async (filter, options) => {
  const units = await Unit.paginate(filter, options);
  return units;
};

/**
 * Get unit by id
 * @param {ObjectId} id
 * @returns {Promise<Unit>}
 */
const getUnitById = async (id) => {
  return Unit.findById(id);
};

/**
 * Update unit by id
 * @param {ObjectId} unitId
 * @param {Object} updateBody
 * @returns {Promise<Unit>}
 */
const updateUnitById = async (unitId, updateBody) => {
  const unit = await getUnitById(unitId);
  if (!unit) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessages.unit.notFound);
  }
  Object.assign(unit, updateBody);
  await unit.save();
  return unit;
};

/**
 * Delete unit by id
 * @param {ObjectId} unitId
 * @returns {Promise<Unit>}
 */
const deleteUnitById = async (unitId) => {
  const unit = await getUnitById(unitId);
  if (!unit) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessages.unit.notFound);
  }
  await unit.remove();
  return unit;
};

module.exports = {
  createUnit,
  queryUnits,
  getUnitById,
  updateUnitById,
  deleteUnitById,
};
