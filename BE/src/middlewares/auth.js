const passport = require('passport');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const responseMessages = require('../constants/responseMessages');
const { User } = require('../models');
const { extractPermissionCodes, formatPermissionsByGroup, isSuperAdminRole, isGlobalRole } = require('../utils/rbac');

const populateUserRole = async (user) => {
  const populatedUser = await User.findById(user.id)
    .populate({
      path: 'role',
      populate: {
        path: 'permissions',
      },
    })
    .populate('branch');
  return populatedUser;
};

const verifyCallback = (req, resolve, reject, requiredRights) => async (err, user, info) => {
  try {
    if (err || info || !user) {
      return reject(new ApiError(httpStatus.UNAUTHORIZED, responseMessages.auth.pleaseAuthenticate));
    }

    const hydratedUser = await populateUserRole(user);
    if (!hydratedUser || !hydratedUser.role) {
      return reject(new ApiError(httpStatus.FORBIDDEN, responseMessages.common.forbidden));
    }

    const permissionDocs = Array.isArray(hydratedUser.role.permissions) ? hydratedUser.role.permissions : [];
    const permissionCodes = extractPermissionCodes(permissionDocs);

    req.user = hydratedUser;
    req.userRole = hydratedUser.role;
    req.userPermissions = permissionCodes;
    req.userPermissionsByGroup = formatPermissionsByGroup(permissionDocs);
    req.isSuperAdmin = isSuperAdminRole(hydratedUser.role);
    req.isGlobalRole = isGlobalRole(hydratedUser.role);

    if (requiredRights.length && !req.isSuperAdmin) {
      const hasRequiredRights = requiredRights.every((requiredRight) => permissionCodes.includes(requiredRight));
      if (!hasRequiredRights && req.params.userId !== String(hydratedUser.id)) {
        return reject(new ApiError(httpStatus.FORBIDDEN, responseMessages.common.forbidden));
      }
    }

    return resolve();
  } catch (error) {
    return reject(error);
  }
};

const auth =
  (...requiredRights) =>
  async (req, res, next) => {
    return new Promise((resolve, reject) => {
      passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
    })
      .then(() => next())
      .catch((err) => next(err));
  };

module.exports = auth;
