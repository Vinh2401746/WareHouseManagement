const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const branchConditionalSchema = Joi.alternatives().conditional('roleId', {
  is: Joi.exist(),
  then: Joi.alternatives().try(Joi.string().custom(objectId), Joi.valid(null)),
  otherwise: Joi.string().required().custom(objectId),
});

const register = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
    roleId: Joi.string().optional().custom(objectId),
    roleKey: Joi.string().trim().optional(),
    role: Joi.string().trim().optional(),
    branch: branchConditionalSchema.messages({
      'any.required': 'Chi nhánh là bắt buộc',
      'string.pattern.base': 'Chi nhánh phải là ObjectId hợp lệ',
    }),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const resetPassword = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
  body: Joi.object().keys({
    password: Joi.string().required().custom(password),
  }),
};

const verifyEmail = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  verifyEmail,
};
