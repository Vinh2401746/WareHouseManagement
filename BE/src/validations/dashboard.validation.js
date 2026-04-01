const Joi = require('joi');
const { objectId } = require('./custom.validation');

const getOverview = {
  query: Joi.object().keys({
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')),
    branchId: Joi.string().custom(objectId),
    warehouseId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  getOverview,
};
