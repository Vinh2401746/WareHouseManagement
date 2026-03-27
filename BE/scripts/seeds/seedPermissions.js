const logger = require('../../src/config/logger');
const { Permission } = require('../../src/models');
const { PERMISSION_DEFINITIONS } = require('../../src/constants/permission.constant');

const seedPermissions = async () => {
  logger.info('[seedPermissions] Start seeding %d permissions', PERMISSION_DEFINITIONS.length);
  const results = [];
  for (const definition of PERMISSION_DEFINITIONS) {
    const payload = {
      code: definition.code,
      name: definition.name,
      group: definition.group || null,
      description: definition.description,
      isSystem: true,
    };

    const permission = await Permission.findOneAndUpdate(
      { code: definition.code },
      { $set: payload },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    results.push(permission);
  }
  logger.info('[seedPermissions] Done');
  return results;
};

module.exports = seedPermissions;
