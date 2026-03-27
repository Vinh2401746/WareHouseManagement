const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { User, Branch, Role } = require('../models');
const ApiError = require('../utils/ApiError');
const responseMessages = require('../constants/responseMessages');
const { applyBranchScope } = require('../utils/branchScope');
const { formatPermissionsByGroup, isGlobalRole } = require('../utils/rbac');
const { ROLES } = require('../constants/permission.constant');

const DEFAULT_ROLE_KEY = ROLES.USER;

const normalizeObjectId = (value) => {
  if (!value) {
    return null;
  }
  if (mongoose.Types.ObjectId.isValid(value)) {
    return value;
  }
  if (value._id && mongoose.Types.ObjectId.isValid(value._id)) {
    return value._id;
  }
  return null;
};

const ensureBranchExists = async (branchId) => {
  const normalized = normalizeObjectId(branchId);
  if (!normalized) {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessages.branch.required);
  }
  const exists = await Branch.exists({ _id: normalized });
  if (!exists) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessages.branch.notFound);
  }
};

const findRoleByIdentifier = async (identifier) => {
  if (!identifier) {
    return null;
  }
  if (typeof identifier === 'object' && identifier._id) {
    return Role.findById(identifier._id);
  }
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    return Role.findById(identifier);
  }
  return Role.findOne({ key: identifier });
};

const loadUserRole = async (user) => {
  if (!user) {
    return null;
  }
  if (user.role && user.role.permissions) {
    return user.role;
  }
  if (user.role) {
    return Role.findById(user.role).populate('permissions');
  }
  if (user.roleKey) {
    return Role.findOne({ key: user.roleKey }).populate('permissions');
  }
  return null;
};

const resolveRoleForPayload = async (payload, { fallbackToDefault = true } = {}) => {
  const identifier = payload.roleId || payload.role || payload.roleKey;
  let roleDoc = await findRoleByIdentifier(identifier);
  if (!roleDoc && fallbackToDefault && !identifier) {
    roleDoc = await Role.findOne({ key: DEFAULT_ROLE_KEY });
  }
  if (!roleDoc) {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessages.user.roleNotFound);
  }
  payload.role = roleDoc._id;
  payload.roleKey = roleDoc.key;
  if (payload.roleId) {
    delete payload.roleId;
  }
  return roleDoc;
};

const ensureBranchForRole = async (roleDoc, branchId) => {
  if (isGlobalRole(roleDoc)) {
    return null;
  }
  if (!branchId) {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessages.branch.required);
  }
  await ensureBranchExists(branchId);
  return branchId;
};

const isSuperAdminUser = (user, roleDoc) => {
  if (!user) {
    return false;
  }
  if (user.roleKey === ROLES.SUPERADMIN) {
    return true;
  }
  return roleDoc && roleDoc.key === ROLES.SUPERADMIN;
};

const assertMutableUser = (user, roleDoc) => {
  if (isSuperAdminUser(user, roleDoc)) {
    throw new ApiError(httpStatus.FORBIDDEN, responseMessages.user.superadminImmutable);
  }
};

const normalizeUserFilter = (filter = {}) => {
  const normalized = { ...filter };
  if (normalized.role) {
    normalized.roleKey = normalized.role;
    delete normalized.role;
  }
  return normalized;
};

const createUser = async (userBody) => {
  const roleDoc = await resolveRoleForPayload(userBody, { fallbackToDefault: true });
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessages.user.emailTaken);
  }

  if (isGlobalRole(roleDoc)) {
    userBody.branch = null;
  } else {
    await ensureBranchForRole(roleDoc, userBody.branch);
  }

  return User.create(userBody);
};

const queryUsers = async (filter, options, requesterContext = {}) => {
  const scopedFilter = applyBranchScope(filter, requesterContext);
  const normalized = normalizeUserFilter(scopedFilter);
  const queryOptions = { ...options };
  const users = await User.paginate(normalized, queryOptions);
  return users;
};

const getUserById = async (id) => {
  return User.findById(id);
};

const getUserByEmail = async (email) => {
  return User.findOne({ email }).populate('branch');
};

const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessages.user.notFound);
  }

  const currentRoleDoc = await loadUserRole(user);
  assertMutableUser(user, currentRoleDoc);

  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessages.user.emailTaken);
  }

  let targetRoleDoc = currentRoleDoc;
  if (updateBody.role || updateBody.roleId || updateBody.roleKey) {
    targetRoleDoc = await resolveRoleForPayload(updateBody, { fallbackToDefault: false });
  }

  if (!targetRoleDoc) {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessages.user.roleNotFound);
  }

  if (isGlobalRole(targetRoleDoc)) {
    updateBody.branch = null;
  } else if (Object.prototype.hasOwnProperty.call(updateBody, 'branch')) {
    await ensureBranchForRole(targetRoleDoc, updateBody.branch);
  } else {
    await ensureBranchForRole(targetRoleDoc, user.branch);
  }

  Object.assign(user, updateBody);
  await user.save();
  return user;
};

const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessages.user.notFound);
  }
  const roleDoc = await loadUserRole(user);
  assertMutableUser(user, roleDoc);
  await user.remove();
  return user;
};

const getUserPermissions = async (user, context = {}) => {
  let targetUser = user;
  if (!targetUser || !targetUser.id) {
    targetUser = await User.findById(user);
  }
  if (!targetUser) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessages.user.notFound);
  }

  let roleDoc = context.role || targetUser.role;
  if (!roleDoc || !roleDoc.permissions) {
    roleDoc = await loadUserRole(targetUser);
  }

  if (!roleDoc) {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessages.user.roleNotFound);
  }

  const permissionDocs = roleDoc.permissions || [];
  const permissionsByGroup = context.permissionsByGroup || formatPermissionsByGroup(permissionDocs);

  return {
    userId: targetUser.id,
    roleId: roleDoc.id,
    roleKey: roleDoc.key,
    roleName: roleDoc.name,
    permissionsByGroup,
  };
};

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  getUserPermissions,
};
