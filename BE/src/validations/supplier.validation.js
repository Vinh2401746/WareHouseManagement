const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createSupplier = {
  body: Joi.object().keys({
    name: Joi.string(),
    phone: Joi.string(),
    email: Joi.string(),
    address: Joi.string(),
  }),
};

const getSuppliers = {
  query: Joi.object().keys({
    name: Joi.string(),
    phone: Joi.string(),
    email: Joi.string(),
    address: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getSupplier = {
  params: Joi.object().keys({
    supplierId: Joi.string().custom(objectId),
  }),
};

const updateSupplier = {
  params: Joi.object().keys({
    supplierId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      phone: Joi.string(),
      email: Joi.string(),
      address: Joi.string(),
    })
    .min(1),
};

const deleteSupplier = {
  params: Joi.object().keys({
    supplierId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createSupplier,
  getSuppliers,
  getSupplier,
  updateSupplier,
  deleteSupplier,
};
