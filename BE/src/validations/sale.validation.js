const Joi = require('joi');
const { objectId } = require('./custom.validation');

const saleItemSchema = Joi.object({
  product: Joi.string().required().custom(objectId),
  batch: Joi.string().custom(objectId),
  quantity: Joi.number().strict().positive().required(),
  price: Joi.number().strict().min(0).required(),
});

const createSale = {
  body: Joi.object()
    .keys({
      code: Joi.string().trim(),
      customerName: Joi.string().trim().allow('', null),
      customer: Joi.string().custom(objectId),
      note: Joi.string().allow('', null),
      status: Joi.string().valid('DRAFT', 'COMPLETED', 'CANCELLED'),
      branch: Joi.string().custom(objectId),
      warehouse: Joi.string().custom(objectId).required(),
      saleDate: Joi.date(),
      discountMoney: Joi.number().min(0),
      taxMoney: Joi.number().min(0),
      paidAmount: Joi.number().min(0),
      items: Joi.array().items(saleItemSchema).min(1).required(),
    })
    .unknown(false),
};

const getSales = {
  query: Joi.object().keys({
    code: Joi.string(),
    customerName: Joi.string(),
    branch: Joi.string().custom(objectId),
    warehouse: Joi.string().custom(objectId),
    soldBy: Joi.string().custom(objectId),
    saleDate: Joi.date(),
    totalAmount: Joi.number().min(0),
    minTotalAmount: Joi.number().min(0),
    maxTotalAmount: Joi.number().min(0),
    sortBy: Joi.string(),
    limit: Joi.number().integer().min(1),
    page: Joi.number().integer().min(1),
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
      code: Joi.string().trim(),
      customerName: Joi.string().trim().allow('', null),
      customer: Joi.string().custom(objectId),
      status: Joi.string().valid('DRAFT', 'COMPLETED', 'CANCELLED'),
      note: Joi.string().allow('', null),
      branch: Joi.string().custom(objectId),
      warehouse: Joi.string().custom(objectId),
      saleDate: Joi.date(),
      discountMoney: Joi.number().min(0),
      taxMoney: Joi.number().min(0),
      paidAmount: Joi.number().min(0),
      items: Joi.array().items(saleItemSchema).min(1),
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
