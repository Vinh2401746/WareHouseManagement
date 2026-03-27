const mongoose = require('mongoose');
const config = require('../../src/config/config');
const logger = require('../../src/config/logger');
const seedPermissions = require('./seedPermissions');
const seedRoles = require('./seedRoles');
const migrateUserRoles = require('./migrateUserRoles');
const seedSuperAdmin = require('./seedSuperAdmin');

const run = async () => {
  logger.info('[seedRbac] Connecting to MongoDB %s', config.mongoose.url);
  await mongoose.connect(config.mongoose.url, config.mongoose.options);

  try {
    await seedPermissions();
    const rolesMap = await seedRoles();
    await migrateUserRoles(rolesMap);
    await seedSuperAdmin(rolesMap);
    logger.info('[seedRbac] Completed successfully');
  } catch (error) {
    logger.error('[seedRbac] Failed with error: %s', error.message);
    throw error;
  } finally {
    await mongoose.disconnect();
    logger.info('[seedRbac] MongoDB disconnected');
  }
};

run()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    logger.error(error);
    process.exit(1);
  });
