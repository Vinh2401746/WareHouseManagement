const Joi = require('joi');

const unitId = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .messages({
    'string.base': 'ID đơn vị phải là chuỗi',
    'string.empty': 'ID đơn vị không được để trống',
    'string.pattern.base': 'ID đơn vị không hợp lệ',
  });

const createUnit = {
  body: Joi.object()
    .keys({
      code: Joi.string().trim().required().messages({
        'string.base': 'Mã đơn vị phải là chuỗi',
        'string.empty': 'Mã đơn vị không được để trống',
        'any.required': 'Mã đơn vị là bắt buộc',
      }),
      name: Joi.string().trim().required().messages({
        'string.base': 'Tên đơn vị phải là chuỗi',
        'string.empty': 'Tên đơn vị không được để trống',
        'any.required': 'Tên đơn vị là bắt buộc',
      }),
    })
    .required()
    .messages({
      'object.base': 'Dữ liệu gửi lên phải là một đối tượng',
      'any.required': 'Thiếu dữ liệu bắt buộc',
    }),
};

const getUnits = {
  query: Joi.object()
    .keys({
      code: Joi.string().trim().messages({
        'string.base': 'Mã đơn vị phải là chuỗi',
        'string.empty': 'Mã đơn vị không được để trống',
      }),
      name: Joi.string().trim().messages({
        'string.base': 'Tên đơn vị phải là chuỗi',
        'string.empty': 'Tên đơn vị không được để trống',
      }),
      limit: Joi.number().integer().allow(null, '').min(1).messages({
        'number.base': 'limit phải là số',
        'number.integer': 'limit phải là số nguyên',
        'number.min': 'limit phải lớn hơn hoặc bằng 1',
      }),
      page: Joi.number().integer().allow(null, '').min(1).messages({
        'number.base': 'page phải là số',
        'number.integer': 'page phải là số nguyên',
        'number.min': 'page phải lớn hơn hoặc bằng 1',
      }),
      sortBy: Joi.string().allow(null, '').trim().messages({
        'string.base': 'sortBy phải là chuỗi',
      }),
    })
    .messages({
      'object.base': 'Tham số truy vấn phải là một đối tượng',
    }),
};

const getUnit = {
  params: Joi.object()
    .keys({
      unitId: unitId.required().messages({
        'any.required': 'ID đơn vị là bắt buộc',
      }),
    })
    .required()
    .messages({
      'object.base': 'Tham số đường dẫn phải là một đối tượng',
      'any.required': 'Thiếu tham số bắt buộc',
    }),
};

const updateUnit = {
  params: Joi.object()
    .keys({
      unitId: unitId.required().messages({
        'any.required': 'ID đơn vị là bắt buộc',
      }),
    })
    .required()
    .messages({
      'object.base': 'Tham số đường dẫn phải là một đối tượng',
      'any.required': 'Thiếu tham số bắt buộc',
    }),
  body: Joi.object()
    .keys({
      code: Joi.string().trim().messages({
        'string.base': 'Mã đơn vị phải là chuỗi',
        'string.empty': 'Mã đơn vị không được để trống',
      }),
      name: Joi.string().trim().messages({
        'string.base': 'Tên đơn vị phải là chuỗi',
        'string.empty': 'Tên đơn vị không được để trống',
      }),
    })
    .min(1)
    .required()
    .messages({
      'object.base': 'Dữ liệu cập nhật phải là một đối tượng',
      'object.min': 'Cần cung cấp ít nhất một trường để cập nhật',
      'any.required': 'Thiếu dữ liệu cập nhật',
    }),
};

const deleteUnit = {
  params: Joi.object()
    .keys({
      unitId: unitId.required().messages({
        'any.required': 'ID đơn vị là bắt buộc',
      }),
    })
    .required()
    .messages({
      'object.base': 'Tham số đường dẫn phải là một đối tượng',
      'any.required': 'Thiếu tham số bắt buộc',
    }),
};

module.exports = {
  createUnit,
  getUnits,
  getUnit,
  updateUnit,
  deleteUnit,
};
