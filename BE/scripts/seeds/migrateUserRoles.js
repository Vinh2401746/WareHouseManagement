const logger = require('../../src/config/logger');
const { User } = require('../../src/models');
const { roles: roleKeys } = require('../../src/config/roles');

const DEFAULT_ROLE_KEY = roleKeys.includes('user') ? 'user' : roleKeys[0];

const resolveRoleKey = (userDoc) => {
  if (!userDoc) {
    return DEFAULT_ROLE_KEY;
  }

  if (typeof userDoc.role === 'string' && userDoc.role) {
    return userDoc.role;
  }

  if (userDoc.roleKey) {
    return userDoc.roleKey;
  }

  return DEFAULT_ROLE_KEY;
};

const migrateUserRoles = async (rolesMap) => {
  logger.info('[migrateUserRoles] Start');
  const users = await User.find({});

  let updatedCount = 0;
  for (const user of users) {
    const targetRoleKey = resolveRoleKey(user);
    const targetRole = rolesMap[targetRoleKey] || rolesMap[DEFAULT_ROLE_KEY];

    if (!targetRole) {
      logger.warn('[migrateUserRoles] Skip user %s - missing role %s', user.email, targetRoleKey);
      continue;
    }

    const updates = {};
    const currentRoleId = user.role && typeof user.role !== 'string' ? user.role.toString() : null;
    if (!currentRoleId || currentRoleId !== targetRole._id.toString()) {
      updates.role = targetRole._id;
    }

    if (!user.roleKey || user.roleKey !== targetRole.key) {
      updates.roleKey = targetRole.key;
    }

    if (Object.keys(updates).length === 0) {
      continue;
    }

    await User.updateOne({ _id: user._id }, { $set: updates });
    updatedCount += 1;
  }

  logger.info('[migrateUserRoles] Done. Updated %d users', updatedCount);
};

module.exports = migrateUserRoles;
