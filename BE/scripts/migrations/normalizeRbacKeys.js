const mongoose = require('mongoose');
const config = require('../../src/config/config');
const logger = require('../../src/config/logger');
const { Permission, Role, User } = require('../../src/models');
const { PERMISSION_DEFINITIONS } = require('../../src/constants/permission.constant');
const { ROLE_DEFINITIONS } = require('../../src/config/roles');

const buildLookup = (definitions, field) =>
  definitions.reduce((accumulator, definition) => {
    const value = definition[field];
    if (value) {
      accumulator[value.toLowerCase()] = value;
    }
    return accumulator;
  }, {});

const canonicalPermissionLookup = buildLookup(PERMISSION_DEFINITIONS, 'code');
const canonicalRoleLookup = buildLookup(ROLE_DEFINITIONS, 'key');

const normalizePermissions = async () => {
  const permissions = await Permission.find({});
  let updated = 0;
  const skipped = [];

  for (const permission of permissions) {
    const currentCode = permission.code || '';
    const canonicalCode = canonicalPermissionLookup[currentCode.toLowerCase()];
    if (!canonicalCode || currentCode === canonicalCode) {
      continue;
    }

    const conflict = await Permission.findOne({ code: canonicalCode, _id: { $ne: permission._id } });
    if (conflict) {
      skipped.push({ existing: permission.code, conflict: conflict._id.toHexString() });
      continue;
    }

    permission.code = canonicalCode;
    await permission.save();
    updated += 1;
    logger.info('[normalizeRbacKeys] Permission %s -> %s', currentCode, canonicalCode);
  }

  return { updated, skipped };
};

const normalizeRoles = async () => {
  const roles = await Role.find({});
  let updated = 0;
  const skipped = [];

  for (const role of roles) {
    const currentKey = role.key || '';
    const canonicalKey = canonicalRoleLookup[currentKey.toLowerCase()];
    if (!canonicalKey || currentKey === canonicalKey) {
      continue;
    }

    const conflict = await Role.findOne({ key: canonicalKey, _id: { $ne: role._id } });
    if (conflict) {
      skipped.push({ existing: role.key, conflict: conflict._id.toHexString() });
      continue;
    }

    role.key = canonicalKey;
    await role.save();
    updated += 1;
    logger.info('[normalizeRbacKeys] Role %s -> %s', currentKey, canonicalKey);
  }

  return { updated, skipped };
};

const normalizeUserRoleKeys = async () => {
  const users = await User.find({});
  let updated = 0;

  for (const user of users) {
    const currentKey = user.roleKey;
    if (!currentKey) {
      continue;
    }
    const canonicalKey = canonicalRoleLookup[currentKey.toLowerCase()];
    if (!canonicalKey || canonicalKey === currentKey) {
      continue;
    }

    await User.updateOne({ _id: user._id }, { $set: { roleKey: canonicalKey } });
    updated += 1;
    logger.info('[normalizeRbacKeys] User %s roleKey %s -> %s', user.email, currentKey, canonicalKey);
  }

  return { updated };
};

const run = async () => {
  await mongoose.connect(config.mongoose.url, config.mongoose.options);
  logger.info('[normalizeRbacKeys] Connected to %s', config.mongoose.url);

  const permissionResult = await normalizePermissions();
  const roleResult = await normalizeRoles();
  const userResult = await normalizeUserRoleKeys();

  logger.info('[normalizeRbacKeys] Permissions updated: %d', permissionResult.updated);
  if (permissionResult.skipped.length) {
    logger.warn('[normalizeRbacKeys] Permission skips: %j', permissionResult.skipped);
  }

  logger.info('[normalizeRbacKeys] Roles updated: %d', roleResult.updated);
  if (roleResult.skipped.length) {
    logger.warn('[normalizeRbacKeys] Role skips: %j', roleResult.skipped);
  }

  logger.info('[normalizeRbacKeys] Users updated: %d', userResult.updated);

  await mongoose.disconnect();
  logger.info('[normalizeRbacKeys] Disconnected');
};

run().catch((error) => {
  logger.error('[normalizeRbacKeys] Failed: %s', error.stack || error.message);
  mongoose.connection.close(() => process.exit(1));
});
