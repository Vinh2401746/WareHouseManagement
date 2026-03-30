const Joi = require('joi');
const { objectId } = require('./custom.validation');

const objectIdArray = Joi.array().items(Joi.string().custom(objectId));

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
    sellingPrice: Joi.number().min(0).default(0).messages({
      'number.base': 'Giá bán phải là số',
      'number.min': 'Giá bán phải lớn hơn hoặc bằng 0',
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
      sellingPrice: Joi.number().min(0),
      package: Joi.string(),
      removeImage: Joi.boolean(),
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

const getInventoryOverview = {
  query: Joi.object().keys({
    keyword: Joi.string(),
    productId: Joi.string().custom(objectId),
    productIds: Joi.alternatives().try(objectIdArray, Joi.string().custom(objectId)),
    warehouse: Joi.alternatives().try(objectIdArray, Joi.string().custom(objectId)),
    warehouseId: Joi.string().custom(objectId),
    warehouseIds: Joi.alternatives().try(objectIdArray, Joi.string().custom(objectId)),
    alertOnly: Joi.boolean(),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
    dateFrom: Joi.date().iso(),
    dateTo: Joi.date().iso(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getInventoryDetail = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId).required(),
  }),
  query: Joi.object().keys({
    warehouse: Joi.alternatives().try(objectIdArray, Joi.string().custom(objectId)),
    warehouseId: Joi.string().custom(objectId),
    warehouseIds: Joi.alternatives().try(objectIdArray, Joi.string().custom(objectId)),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
    dateFrom: Joi.date().iso(),
    dateTo: Joi.date().iso(),
  }),
};

const getProductsForPOS = {
  query: Joi.object().keys({
    keyword: Joi.string().allow(''),
    warehouseId: Joi.string().custom(objectId).required(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
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
  getInventoryOverview,
  getInventoryDetail,
  getProductsForPOS,
};
