const logger = require('../../src/config/logger');
const { User } = require('../../src/models');

const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL || 'admin@gmail.com';
const SUPERADMIN_NAME = process.env.SUPERADMIN_NAME || 'Super Admin';

const seedSuperAdmin = async (rolesMap) => {
  const superadminRole = rolesMap.superadmin;
  if (!superadminRole) {
    throw new Error('Superadmin role was not seeded. Abort.');
  }

  const passwordHashFromEnv = process.env.SUPERADMIN_PASSWORD_HASH;
  const passwordPlainFromEnv = process.env.SUPERADMIN_PASSWORD;

  const existingUser = await User.findOne({ email: SUPERADMIN_EMAIL });
  if (existingUser) {
    const updates = {};
    if (!existingUser.role || existingUser.role.toString() !== superadminRole._id.toString()) {
      updates.role = superadminRole._id;
    }
    if (existingUser.roleKey !== superadminRole.key) {
      updates.roleKey = superadminRole.key;
    }
    if (existingUser.branch !== null) {
      updates.branch = null;
    }

    if (Object.keys(updates).length > 0) {
      await User.updateOne({ _id: existingUser._id }, { $set: updates });
      logger.info('[seedSuperAdmin] Updated seed user role binding');
    } else {
      logger.info('[seedSuperAdmin] Seed user already in sync');
    }
    return existingUser;
  }

  if (!passwordHashFromEnv && !passwordPlainFromEnv) {
    throw new Error('Missing SUPERADMIN_PASSWORD or SUPERADMIN_PASSWORD_HASH in environment');
  }

  const user = new User({
    name: SUPERADMIN_NAME,
    email: SUPERADMIN_EMAIL,
    password: passwordHashFromEnv || passwordPlainFromEnv,
    branch: null,
    role: superadminRole._id,
    roleKey: superadminRole.key,
    isEmailVerified: true,
  });

  if (passwordHashFromEnv) {
    user.$locals = user.$locals || {};
    user.$locals.skipPasswordHash = true;
  }

  await user.save();
  logger.info('[seedSuperAdmin] Created default superadmin account %s', SUPERADMIN_EMAIL);
  return user;
};

module.exports = seedSuperAdmin;
