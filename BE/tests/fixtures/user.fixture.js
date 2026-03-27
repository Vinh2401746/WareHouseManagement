const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const faker = require('faker');
const User = require('../../src/models/user.model');
const { branchOne, branchTwo } = require('./branch.fixture');
const { ensureRolesSeeded, ROLES } = require('./rbac.fixture');

const password = 'admin123';
const salt = bcrypt.genSaltSync(8);
const hashedPassword = bcrypt.hashSync(password, salt);

const userOne = {
  _id: mongoose.Types.ObjectId(),
  name: faker.name.findName(),
  email: faker.internet.email().toLowerCase(),
  password,
  role: ROLES.ADMIN,
  roleKey: ROLES.ADMIN,
  branch: branchOne._id,
  isEmailVerified: false,
};

const userTwo = {
  _id: mongoose.Types.ObjectId(),
  name: faker.name.findName(),
  email: faker.internet.email().toLowerCase(),
  password,
  role: ROLES.WAREHOUSE_STAFF,
  roleKey: ROLES.WAREHOUSE_STAFF,
  branch: branchOne._id,
  isEmailVerified: false,
};

const admin = {
  _id: mongoose.Types.ObjectId(),
  name: faker.name.findName(),
  email: faker.internet.email().toLowerCase(),
  password,
  role: ROLES.SYSTEM_ADMIN,
  roleKey: ROLES.SYSTEM_ADMIN,
  branch: branchTwo._id,
  isEmailVerified: false,
};

const superAdmin = {
  _id: mongoose.Types.ObjectId(),
  name: faker.name.findName(),
  email: faker.internet.email().toLowerCase(),
  password,
  role: ROLES.SUPERADMIN,
  roleKey: ROLES.SUPERADMIN,
  branch: null,
  isEmailVerified: true,
};

const attachRoleReference = (user, roleMap) => {
  const requestedKey = user.roleKey || user.role || ROLES.USER;
  const normalizedKey =
    typeof requestedKey === 'string'
      ? requestedKey
      : requestedKey && typeof requestedKey === 'object' && requestedKey.key
        ? requestedKey.key
        : ROLES.USER;

  const roleDoc =
    roleMap[normalizedKey] ||
    (typeof normalizedKey === 'string'
      ? Object.values(roleMap).find((role) => role.key.toLowerCase() === normalizedKey.toLowerCase())
      : null);

  if (!roleDoc) {
    throw new Error(`Role with key ${normalizedKey} not found for test fixture`);
  }
  return {
    ...user,
    role: roleDoc._id,
    roleKey: roleDoc.key,
  };
};

const insertUsers = async (users) => {
  const roleMap = await ensureRolesSeeded();
  const payloads = users.map((user) => {
    const withRole = attachRoleReference(user, roleMap);
    return { ...withRole, password: hashedPassword };
  });
  await User.deleteMany({});
  if (payloads.length > 0) {
    await User.insertMany(payloads);
  }
};

module.exports = {
  userOne,
  userTwo,
  admin,
  superAdmin,
  insertUsers,
};
