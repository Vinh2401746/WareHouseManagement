const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const roleIdentifierSchema = Joi.string().trim();
const roleObjectIdSchema = Joi.string().custom(objectId);

const optionalBranchSchema = Joi.alternatives().try(Joi.string().custom(objectId), Joi.valid(null));

const createBranchSchema = Joi.alternatives().conditional('roleId', {
  is: Joi.exist(),
  then: optionalBranchSchema,
  otherwise: Joi.string().required().custom(objectId),
});

const createUser = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
    branch: createBranchSchema.messages({
      'any.required': 'Chi nhánh là bắt buộc',
      'string.pattern.base': 'Chi nhánh phải là ObjectId hợp lệ',
    }),
    roleId: roleObjectIdSchema.optional(),
    roleKey: roleIdentifierSchema.optional(),
    role: roleIdentifierSchema.optional(),
  }),
};

const getUsers = {
  query: Joi.object().keys({
    name: Joi.string(),
    role: roleIdentifierSchema,
    roleKey: roleIdentifierSchema,
    roleId: roleObjectIdSchema,
    branch: Joi.string().custom(objectId),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      // password: Joi.string().custom(password),
      name: Joi.string(),
      branch: optionalBranchSchema,
      roleId: roleObjectIdSchema,
      roleKey: roleIdentifierSchema,
      role: roleIdentifierSchema,
    })
    .min(1),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const changeUserPassword = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      password: Joi.string().required().custom(password),
      currentPassword: Joi.string(),
    })
    .required(),
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  changeUserPassword,
};
