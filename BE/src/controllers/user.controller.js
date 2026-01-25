const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
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
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // If updating own password, require currentPassword to match
  if (req.user.id === String(targetUser.id)) {
    if (!currentPassword || !(await targetUser.isPasswordMatch(currentPassword))) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Current password is incorrect');
    }
  }

  const updated = await userService.updateUserById(userId, { password: newPassword });
  res.status(httpStatus.OK).send(updated);
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  changeUserPassword,
};
