const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createSale = {
  body: Joi.object().keys({
    code: Joi.string(),
    branch: Joi.string(),
    warehouse: Joi.string(),
    soldBy: Joi.string(),
    saleDate: Joi.string(),
    totalAmount: Joi.string(),
    items: Joi.string(),
  }),
};

const getSales = {
  query: Joi.object().keys({
    code: Joi.string(),
    branch: Joi.string(),
    warehouse: Joi.string(),
    soldBy: Joi.string(),
    saleDate: Joi.string(),
    totalAmount: Joi.string(),
    items: Joi.string(),
  }),
};

const getSale = {
  params: Joi.object().keys({
    saleId: Joi.string().custom(objectId),
  }),
};

const updateSale = {
  params: Joi.object().keys({
    saleId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      code: Joi.string(),
      branch: Joi.string(),
      warehouse: Joi.string(),
      soldBy: Joi.string(),
      saleDate: Joi.string(),
      totalAmount: Joi.string(),
      items: Joi.string(),
    })
    .min(1),
};

const deleteSale = {
  params: Joi.object().keys({
    saleId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createSale,
  getSales,
  getSale,
  updateSale,
  deleteSale,
};
