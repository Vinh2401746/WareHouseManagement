const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createProduct = {
  body: Joi.object().keys({
    code: Joi.string().required().messages({
      'any.required': 'Mã sản phẩm là bắt buộc',
      'string.base': 'Mã sản phẩm phải là chuỗi',
    }),
    name: Joi.string().required().messages({
      'any.required': 'Tên sản phẩm là bắt buộc',
      'string.base': 'Tên sản phẩm phải là chuỗi',
    }),
    unit: Joi.string().required().messages({
      'any.required': 'Đơn vị là bắt buộc',
      'string.base': 'Đơn vị phải là chuỗi',
    }),
    minStock: Joi.number().integer().min(0).default(0).required().messages({
      'any.required': 'Số lượng tối thiểu là bắt buộc',
      'number.base': 'Số lượng tối thiểu phải là số',
      'number.integer': 'Số lượng tối thiểu phải là số nguyên',
      'number.min': 'Số lượng tối thiểu phải lớn hơn hoặc bằng 0',
    }),
    package: Joi.string().messages({
      'string.base': 'Quy cách đóng gói phải là chuỗi',
    }),
  }),
};

const getProducts = {
  query: Joi.object().keys({
    code: Joi.string(),
    name: Joi.string(),
    unit: Joi.string(),
    minStock: Joi.number().integer().min(0),
    package: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getProduct = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId),
  }),
};

const updateProduct = {
  params: Joi.object().keys({
    productId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      code: Joi.string(),
      name: Joi.string(),
      unit: Joi.string(),
      minStock: Joi.number().integer().min(0),
      package: Joi.string(),
    })
    .min(1),
};

const deleteProduct = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId),
  }),
};

const importProducts = {
  // File validation is handled by multer middleware; no body/query schema needed
};

const exportProducts = {
  query: Joi.object().keys({
    code: Joi.string(),
    name: Joi.string(),
  }),
};

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  importProducts,
  exportProducts,
};

