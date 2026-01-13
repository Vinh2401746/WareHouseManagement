const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createBranch = {
  body: Joi.object().keys({
    name: Joi.string(),
    address: Joi.string(),
    phone: Joi.string(),
  }),
};

const getBranchs = {
  query: Joi.object().keys({
    name: Joi.string(),
    address: Joi.string(),
    phone: Joi.string(),
  }),
};

const getBranch = {
  params: Joi.object().keys({
    branchId: Joi.string().custom(objectId),
  }),
};

const updateBranch = {
  params: Joi.object().keys({
    branchId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      address: Joi.string(),
      phone: Joi.string(),
    })
    .min(1),
};

const deleteBranch = {
  params: Joi.object().keys({
    branchId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createBranch,
  getBranchs,
  getBranch,
  updateBranch,
  deleteBranch,
};
