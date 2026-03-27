const httpStatus = require('http-status');
const { Permission, Role } = require('../models');
const ApiError = require('../utils/ApiError');
const responseMessages = require('../constants/responseMessages');

const ensureUniqueCode = async (code, excludeId = null) => {
  if (!code) {
    return null;
  }
  const normalizedCode = String(code).trim().toLowerCase();
  const query = { code: normalizedCode };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  const existingPermission = await Permission.findOne(query).lean();
  if (existingPermission) {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessages.permission.codeExists);
  }
  return normalizedCode;
};

const createPermission = async (permissionBody, context = {}) => {
  const payload = { ...permissionBody };
  payload.code = await ensureUniqueCode(permissionBody.code);
  if (context.userId) {
    payload.createdBy = context.userId;
  }
  const permission = await Permission.create(payload);
  return permission;
};

const queryPermissions = async (filter, options) => {
  return Permission.paginate(filter, options);
};

const getPermissionById = async (id) => {
  return Permission.findById(id);
};

const updatePermissionById = async (permissionId, updateBody, context = {}) => {
  const permission = await getPermissionById(permissionId);
  if (!permission) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessages.permission.notFound);
  }

  if (permission.isSystem && (updateBody.code || updateBody.isSystem === false)) {
    throw new ApiError(httpStatus.FORBIDDEN, responseMessages.permission.systemImmutable);
  }

  if (updateBody.code) {
    updateBody.code = await ensureUniqueCode(updateBody.code, permissionId);
  }

  if (context.userId) {
    updateBody.updatedBy = context.userId;
  }

  Object.assign(permission, updateBody);
  await permission.save();
  return permission;
};

const deletePermissionById = async (permissionId) => {
  const permission = await getPermissionById(permissionId);
  if (!permission) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessages.permission.notFound);
  }

  if (permission.isSystem) {
    throw new ApiError(httpStatus.FORBIDDEN, responseMessages.permission.systemDeleteForbidden);
  }

  const roleUsingPermission = await Role.exists({ permissions: permissionId });
  if (roleUsingPermission) {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessages.permission.inUse);
  }

  await permission.remove();
  return permission;
};

module.exports = {
  createPermission,
  queryPermissions,
  getPermissionById,
  updatePermissionById,
  deletePermissionById,
};
