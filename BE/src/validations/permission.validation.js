const Joi = require('joi');
const { objectId } = require('./custom.validation');

const permissionIdSchema = Joi.object()
  .keys({
    permissionId: Joi.string().required().custom(objectId).messages({
      'any.required': 'ID quyền là bắt buộc',
    }),
  })
  .required();

const codeSchema = Joi.string().trim().lowercase().messages({
  'string.base': 'Mã quyền phải là chuỗi',
  'string.empty': 'Mã quyền không được để trống',
});

const createPermission = {
  body: Joi.object()
    .keys({
      code: codeSchema.required().messages({
        'any.required': 'Mã quyền là bắt buộc',
      }),
      name: Joi.string().trim().required().messages({
        'string.base': 'Tên quyền phải là chuỗi',
        'string.empty': 'Tên quyền không được để trống',
        'any.required': 'Tên quyền là bắt buộc',
      }),
      group: Joi.string().trim().allow(null, '').messages({
        'string.base': 'Nhóm quyền phải là chuỗi',
      }),
      description: Joi.string().trim().allow(null, '').messages({
        'string.base': 'Mô tả quyền phải là chuỗi',
      }),
      isSystem: Joi.boolean().messages({
        'boolean.base': 'isSystem phải là kiểu boolean',
      }),
    })
    .required()
    .messages({
      'object.base': 'Dữ liệu tạo quyền phải là đối tượng',
      'any.required': 'Thiếu dữ liệu tạo quyền',
    }),
};

const getPermissions = {
  query: Joi.object()
    .keys({
      code: codeSchema,
      name: Joi.string().trim().messages({
        'string.base': 'Tên quyền phải là chuỗi',
      }),
      group: Joi.string().trim().messages({
        'string.base': 'Nhóm quyền phải là chuỗi',
      }),
      isSystem: Joi.boolean().messages({
        'boolean.base': 'isSystem phải là kiểu boolean',
      }),
      sortBy: Joi.string().trim(),
      limit: Joi.number().integer().min(1),
      page: Joi.number().integer().min(1),
    })
    .messages({
      'object.base': 'Tham số truy vấn phải là đối tượng',
    }),
};

const updatePermission = {
  params: permissionIdSchema,
  body: Joi.object()
    .keys({
      code: codeSchema,
      name: Joi.string().trim().messages({
        'string.base': 'Tên quyền phải là chuỗi',
      }),
      group: Joi.string().trim().allow(null, '').messages({
        'string.base': 'Nhóm quyền phải là chuỗi',
      }),
      description: Joi.string().trim().allow(null, '').messages({
        'string.base': 'Mô tả quyền phải là chuỗi',
      }),
      isSystem: Joi.boolean().messages({
        'boolean.base': 'isSystem phải là kiểu boolean',
      }),
    })
    .min(1)
    .required()
    .messages({
      'object.base': 'Dữ liệu cập nhật quyền phải là đối tượng',
      'object.min': 'Cần cung cấp ít nhất một trường để cập nhật',
      'any.required': 'Thiếu dữ liệu cập nhật quyền',
    }),
};

const deletePermission = {
  params: permissionIdSchema,
};

const getPermission = {
  params: permissionIdSchema,
};

module.exports = {
  createPermission,
  getPermissions,
  getPermission,
  updatePermission,
  deletePermission,
};
