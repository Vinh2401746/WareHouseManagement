const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createWarehouse = {
  body: Joi.object().keys({
    name: Joi.string(),
    branch: Joi.string(),
    address: Joi.string(),
  }),
};

const getWarehouses = {
  query: Joi.object().keys({
    name: Joi.string(),
    branch: Joi.string(),
    address: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getWarehouse = {
  params: Joi.object().keys({
    warehouseId: Joi.string().custom(objectId),
  }),
};

const updateWarehouse = {
  params: Joi.object().keys({
    warehouseId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      branch: Joi.string(),
      address: Joi.string(),
    })
    .min(1),
};

const deleteWarehouse = {
  params: Joi.object().keys({
    warehouseId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createWarehouse,
  getWarehouses,
  getWarehouse,
  updateWarehouse,
  deleteWarehouse,
};
