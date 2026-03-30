const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createCustomer = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    branch: Joi.string().custom(objectId).optional(),
    phone: Joi.string().allow('', null),
    email: Joi.string().email().allow('', null),
    address: Joi.string().allow('', null),
    note: Joi.string().allow('', null),
  }),
};

const getCustomers = {
  query: Joi.object().keys({
    name: Joi.string(),
    phone: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getCustomer = {
  params: Joi.object().keys({
    customerId: Joi.string().custom(objectId),
  }),
};

const updateCustomer = {
  params: Joi.object().keys({
    customerId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      phone: Joi.string().allow('', null),
      email: Joi.string().email().allow('', null),
      address: Joi.string().allow('', null),
      note: Joi.string().allow('', null),
      branch: Joi.string().custom(objectId).optional(),
    })
    .min(1),
};

const deleteCustomer = {
  params: Joi.object().keys({
    customerId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createCustomer,
  getCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
};
