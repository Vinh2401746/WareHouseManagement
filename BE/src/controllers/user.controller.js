const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');
const responseMessages = require('../constants/responseMessages');

const buildScopeContext = (req) => ({
  branch: req.user ? req.user.branch : null,
  role: req.userRole,
  isGlobalRole: req.isGlobalRole,
});

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role', 'branch']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const scopeContext = buildScopeContext(req);
  const result = await userService.queryUsers(filter, options, scopeContext);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessages.user.notFound);
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

const changeUserPassword = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { password: newPassword, currentPassword } = req.body;
  const targetUser = await userService.getUserById(userId);
  if (!targetUser) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessages.user.notFound);
  }

  // If updating own password, require currentPassword to match
  if (req.user.id === String(targetUser.id)) {
    if (!currentPassword || !(await targetUser.isPasswordMatch(currentPassword))) {
      throw new ApiError(httpStatus.UNAUTHORIZED, responseMessages.user.currentPasswordIncorrect);
    }
  }

  const updated = await userService.updateUserById(userId, { password: newPassword });
  res.status(httpStatus.OK).send(updated);
});

const getMyPermissions = catchAsync(async (req, res) => {
  const payload = await userService.getUserPermissions(req.user, {
    role: req.userRole,
    permissionsByGroup: req.userPermissionsByGroup,
  });
  res.status(httpStatus.OK).send(payload);
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  changeUserPassword,
  getMyPermissions,
};
