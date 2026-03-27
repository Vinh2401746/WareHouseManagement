const mongoose = require('mongoose');
const config = require('../../src/config/config');
const { insertUsers, userOne, userTwo, admin, superAdmin } = require('../fixtures/user.fixture');

const DEFAULT_USERS = [userOne, userTwo, admin, superAdmin];

const setupTestDB = ({ seedUsers = true } = {}) => {
  beforeAll(async () => {
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
  });

  beforeEach(async () => {
    await Promise.all(Object.values(mongoose.connection.collections).map(async (collection) => collection.deleteMany()));
    if (seedUsers) {
      await insertUsers(DEFAULT_USERS);
    }
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });
};

module.exports = setupTestDB;
