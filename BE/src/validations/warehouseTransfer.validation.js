const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createWarehouseTransfer = {
  body: Joi.object().keys({
    sourceWarehouse: Joi.string().required().custom(objectId).messages({
      'any.required': 'Kho nguồn là bắt buộc',
    }),
    destinationWarehouse: Joi.string().required().custom(objectId).messages({
      'any.required': 'Kho đích là bắt buộc',
    }),
    reason: Joi.string().allow('').messages({
      'string.base': 'Lý do phải là chuỗi',
    }),
    note: Joi.string().allow('').messages({
      'string.base': 'Ghi chú phải là chuỗi',
    }),
    items: Joi.array()
      .items(
        Joi.object().keys({
          product: Joi.string().required().custom(objectId).messages({
            'any.required': 'Sản phẩm là bắt buộc',
          }),
          batch: Joi.alternatives().try(Joi.string().custom(objectId), Joi.valid('', null)).messages({
            'string.base': 'Batch phải là chuỗi',
          }),
          quantity: Joi.number().integer().min(1).required().messages({
            'any.required': 'Số lượng là bắt buộc',
            'number.base': 'Số lượng phải là số',
            'number.integer': 'Số lượng phải là số nguyên',
            'number.min': 'Số lượng phải lớn hơn hoặc bằng 1',
          }),
        })
      )
      .min(1)
      .required()
      .messages({
        'any.required': 'items là bắt buộc',
        'array.base': 'items phải là một mảng',
        'array.min': 'items phải chứa ít nhất 1 phần tử',
      }),
  }),
};

const getWarehouseTransfers = {
  query: Joi.object().keys({
    status: Joi.string().valid('PENDING', 'COMPLETED', 'CANCELED'),
    sourceWarehouse: Joi.custom(objectId),
    destinationWarehouse: Joi.custom(objectId),
    code: Joi.string().allow('', null),
    createdBy: Joi.custom(objectId),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getWarehouseTransfer = {
  params: Joi.object().keys({
    warehouseTransferId: Joi.string().required().custom(objectId).messages({
      'any.required': 'Mã phiếu luân chuyển là bắt buộc',
    }),
  }),
};

const approveWarehouseTransfer = {
  params: Joi.object().keys({
    warehouseTransferId: Joi.string().required().custom(objectId).messages({
      'any.required': 'Mã phiếu luân chuyển là bắt buộc',
    }),
  }),
};

const cancelWarehouseTransfer = {
  params: Joi.object().keys({
    warehouseTransferId: Joi.string().required().custom(objectId).messages({
      'any.required': 'Mã phiếu luân chuyển là bắt buộc',
    }),
  }),
  body: Joi.object().keys({
    cancelReason: Joi.string().allow('').messages({
      'string.base': 'Lý do hủy phải là chuỗi',
    }),
  }),
};

module.exports = {
  createWarehouseTransfer,
  getWarehouseTransfers,
  getWarehouseTransfer,
  approveWarehouseTransfer,
  cancelWarehouseTransfer,
};
