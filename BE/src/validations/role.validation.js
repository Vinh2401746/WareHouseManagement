const Joi = require('joi');
const { objectId } = require('./custom.validation');

const roleIdSchema = Joi.object()
  .keys({
    roleId: Joi.string().required().custom(objectId).messages({
      'any.required': 'ID vai trò là bắt buộc',
    }),
  })
  .required();

const permissionIdsSchema = Joi.array()
  .items(
    Joi.string()
      .custom(objectId)
      .messages({
        'string.pattern.base': 'permissionId phải là ObjectId hợp lệ',
      })
  )
  .messages({
    'array.base': 'permissionIds phải là một mảng',
  });

const baseRoleBody = {
  name: Joi.string().trim().messages({
    'string.base': 'Tên vai trò phải là chuỗi',
    'string.empty': 'Tên vai trò không được để trống',
  }),
  key: Joi.string().trim().lowercase().messages({
    'string.base': 'Mã vai trò phải là chuỗi',
    'string.empty': 'Mã vai trò không được để trống',
  }),
  description: Joi.string().trim().allow(null, '').messages({
    'string.base': 'Mô tả vai trò phải là chuỗi',
  }),
  scope: Joi.string()
    .valid('branch', 'global')
    .messages({
      'any.only': 'scope chỉ nhận giá trị branch hoặc global',
    }),
  permissionIds: permissionIdsSchema,
  isSystem: Joi.boolean().messages({
    'boolean.base': 'isSystem phải là boolean',
  }),
  isImmutable: Joi.boolean().messages({
    'boolean.base': 'isImmutable phải là boolean',
  }),
};

const createRole = {
  body: Joi.object()
    .keys({
      ...baseRoleBody,
      name: baseRoleBody.name.required().messages({
        'any.required': 'Tên vai trò là bắt buộc',
      }),
      key: baseRoleBody.key.required().messages({
        'any.required': 'Mã vai trò là bắt buộc',
      }),
    })
    .required()
    .messages({
      'object.base': 'Dữ liệu tạo vai trò phải là đối tượng',
      'any.required': 'Thiếu dữ liệu tạo vai trò',
    }),
};

const getRoles = {
  query: Joi.object()
    .keys({
      key: baseRoleBody.key,
      name: baseRoleBody.name,
      scope: baseRoleBody.scope,
      isSystem: baseRoleBody.isSystem,
      sortBy: Joi.string().trim(),
      limit: Joi.number().integer().min(1),
      page: Joi.number().integer().min(1),
    })
    .messages({
      'object.base': 'Tham số truy vấn phải là đối tượng',
    }),
};

const updateRole = {
  params: roleIdSchema,
  body: Joi.object()
    .keys(baseRoleBody)
    .min(1)
    .required()
    .messages({
      'object.base': 'Dữ liệu cập nhật vai trò phải là đối tượng',
      'object.min': 'Cần ít nhất một trường để cập nhật',
      'any.required': 'Thiếu dữ liệu cập nhật vai trò',
    }),
};

const getRole = {
  params: roleIdSchema,
};

const deleteRole = {
  params: roleIdSchema,
};

module.exports = {
  createRole,
  getRoles,
  getRole,
  updateRole,
  deleteRole,
};
