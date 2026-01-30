const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createInventoryTransaction = {
  body: Joi.object().keys({
    type: Joi.string(),
    reason: Joi.string(),
    warehouse: Joi.string(),
    supplier: Joi.string(),
    sale: Joi.string(),
    createdBy: Joi.string(),
    transactionDate: Joi.date(),
    items: Joi.string(),
  }),
};

const getInventoryTransactions = {
  query: Joi.object().keys({
    type: Joi.string(),
    reason: Joi.string(),
    warehouse: Joi.string(),
    supplier: Joi.string(),
    sale: Joi.string(),
    createdBy: Joi.string(),
    transactionDate: Joi.date(),
    items: Joi.string(),
  }),
};

const getInventoryTransaction = {
  params: Joi.object().keys({
    inventoryTransactionId: Joi.string().custom(objectId),
  }),
};

const updateInventoryTransaction = {
  params: Joi.object().keys({
    inventoryTransactionId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      type: Joi.string(),
      reason: Joi.string(),
      warehouse: Joi.string(),
      supplier: Joi.string(),
      sale: Joi.string(),
      createdBy: Joi.string(),
      transactionDate: Joi.date(),
      items: Joi.string(),
    })
    .min(1),
};

const deleteInventoryTransaction = {
  params: Joi.object().keys({
    inventoryTransactionId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createInventoryTransaction,
  getInventoryTransactions,
  getInventoryTransaction,
  updateInventoryTransaction,
  deleteInventoryTransaction,
};
