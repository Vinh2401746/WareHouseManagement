const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { Role, Permission, User } = require('../models');
const ApiError = require('../utils/ApiError');
const responseMessages = require('../constants/responseMessages');

const toObjectId = (value) => {
  if (!value) {
    return null;
  }
  if (mongoose.Types.ObjectId.isValid(value)) {
    return mongoose.Types.ObjectId(value);
  }
  if (value._id && mongoose.Types.ObjectId.isValid(value._id)) {
    return mongoose.Types.ObjectId(value._id);
  }
  return null;
};

const ensureUniqueKey = async (key, excludeId = null) => {
  if (!key) {
    return null;
  }
  const normalizedKey = String(key).trim().toLowerCase();
  const query = { key: normalizedKey };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  const existingRole = await Role.findOne(query).lean();
  if (existingRole) {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessages.role.keyExists);
  }
  return normalizedKey;
};

const resolvePermissionIds = async (permissionIds = []) => {
  if (!Array.isArray(permissionIds) || permissionIds.length === 0) {
    return [];
  }
  const normalizedIds = [...new Set(permissionIds.map((id) => toObjectId(id)).filter(Boolean))];
  if (normalizedIds.length === 0) {
    return [];
  }
  const permissions = await Permission.find({ _id: { $in: normalizedIds } }).select('_id').lean();
  if (permissions.length !== normalizedIds.length) {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessages.permission.invalidSelection);
  }
  return normalizedIds;
};

const appendPermissionIds = async (payload = {}) => {
  if (payload.permissionIds) {
    payload.permissions = await resolvePermissionIds(payload.permissionIds);
    delete payload.permissionIds;
  }
  return payload;
};

const createRole = async (roleBody) => {
  const payload = await appendPermissionIds({ ...roleBody });
  payload.key = await ensureUniqueKey(payload.key);
  const role = await Role.create(payload);
  return role.populate('permissions');
};

const queryRoles = async (filter, options) => {
  return Role.paginate(filter, options);
};

const getRoleById = async (id) => {
  return Role.findById(id).populate('permissions');
};

const assertRoleMutable = (role) => {
  if (role.isImmutable) {
    throw new ApiError(httpStatus.FORBIDDEN, responseMessages.role.immutable);
  }
};

const updateRoleById = async (roleId, updateBody) => {
  const role = await Role.findById(roleId);
  if (!role) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessages.role.notFound);
  }

  assertRoleMutable(role);

  if (updateBody.key) {
    updateBody.key = await ensureUniqueKey(updateBody.key, roleId);
  }

  await appendPermissionIds(updateBody);

  Object.assign(role, updateBody);
  await role.save();
  return role.populate('permissions');
};

const deleteRoleById = async (roleId) => {
  const role = await Role.findById(roleId);
  if (!role) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessages.role.notFound);
  }

  assertRoleMutable(role);

  if (role.isSystem) {
    throw new ApiError(httpStatus.FORBIDDEN, responseMessages.role.systemDeleteForbidden);
  }

  const userUsingRole = await User.exists({ role: roleId });
  if (userUsingRole) {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessages.role.inUse);
  }

  await role.remove();
  return role;
};

module.exports = {
  createRole,
  queryRoles,
  getRoleById,
  updateRoleById,
  deleteRoleById,
};
