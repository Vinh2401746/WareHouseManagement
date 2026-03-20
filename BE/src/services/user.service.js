const httpStatus = require('http-status');
const { User, Branch } = require('../models');
const { roleRights } = require('../config/roles');
const { PERMISSION_GROUPS } = require('../constants/permission.constant');
const ApiError = require('../utils/ApiError');
const responseMessages = require('../constants/responseMessages');

/**
 * Đảm bảo chi nhánh tồn tại trước khi gán cho user
 * @param {string|ObjectId} branchId
 */
const ensureBranchExists = async (branchId) => {
  const exists = await Branch.exists({ _id: branchId });
  if (!exists) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessages.branch.notFound);
  }
};

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  await ensureBranchExists(userBody.branch);
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessages.user.emailTaken);
  }
  return User.create(userBody);
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findById(id);
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email }).populate('branch');
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessages.user.notFound);
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessages.user.emailTaken);
  }
  if (updateBody.branch) {
    await ensureBranchExists(updateBody.branch);
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessages.user.notFound);
  }
  await user.remove();
  return user;
};

const formatPermissionsByGroup = (rights) => {
  return Object.entries(PERMISSION_GROUPS).reduce((acc, [groupKey, groupPerms]) => {
    const granted = groupPerms.filter((perm) => rights.includes(perm));
    if (granted.length) {
      acc[groupKey] = granted;
    }
    return acc;
  }, {});
};

/**
 * Lấy danh sách quyền của người dùng từ vai trò theo từng nhóm
 * @param {string} role
 * @returns {Object}
 */
const getUserPermissions = (role) => {
  const rights = roleRights.get(role);
  if (!rights) {
    throw new ApiError(httpStatus.FORBIDDEN, responseMessages.common.forbidden);
  }
  return formatPermissionsByGroup(rights);
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
