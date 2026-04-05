const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createProductBatch = {
  body: Joi.object().keys({
    product: Joi.custom(objectId).required(),
    warehouse: Joi.custom(objectId).required(),
    batchCode: Joi.string(),
    manufactureDate: Joi.date(),
    expiryDate: Joi.date().required(),
    quantity: Joi.number().min(0).required(),
    importPrice: Joi.number().required(),
  }),
};

const getProductBatchs = {
  query: Joi.object().keys({
    product: Joi.custom(objectId),
    warehouse: Joi.custom(objectId),
    batchCode: Joi.string(),
    keyword: Joi.string().allow('', null),
    status: Joi.string().valid('VALID', 'EXPIRING', 'EXPIRED', '').allow('', null),
    stockStatus: Joi.string().valid('AVAILABLE', 'EMPTY', '').allow('', null),
    manufactureDate: Joi.date(),
    expiryDate: Joi.date(),
    quantity: Joi.number(),
    importPrice: Joi.number(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getProductBatch = {
  params: Joi.object().keys({
    productBatchId: Joi.string().custom(objectId),
  }),
};

const updateProductBatch = {
  params: Joi.object().keys({
    productBatchId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      product: Joi.string(),
      warehouse: Joi.string(),
      batchCode: Joi.string(),
      manufactureDate: Joi.date(),
      expiryDate: Joi.date(),
      quantity: Joi.number().min(0),
      importPrice: Joi.number(),
    })
    .min(1),
};

const deleteProductBatch = {
  params: Joi.object().keys({
    productBatchId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createProductBatch,
  getProductBatchs,
  getProductBatch,
  updateProductBatch,
  deleteProductBatch,
};
