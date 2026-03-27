const logger = require('../../src/config/logger');
const { Role, Permission } = require('../../src/models');
const { ROLE_DEFINITIONS } = require('../../src/config/roles');

const seedRoles = async () => {
  logger.info('[seedRoles] Start seeding %d roles', ROLE_DEFINITIONS.length);
  const permissionDocs = await Permission.find({});
  const permissionMap = permissionDocs.reduce((accumulator, permission) => {
    accumulator[permission.code] = permission;
    return accumulator;
  }, {});

  const rolesMap = {};
  for (const definition of ROLE_DEFINITIONS) {
    const permissionIds = (definition.permissions || [])
      .map((code) => permissionMap[code])
      .filter(Boolean)
      .map((permission) => permission._id);

    const payload = {
      name: definition.name,
      key: definition.key,
      description: definition.description,
      permissions: permissionIds,
      scope: definition.scope || 'branch',
      isSystem: definition.isSystem !== undefined ? definition.isSystem : true,
      isImmutable: Boolean(definition.isImmutable),
    };

    const role = await Role.findOneAndUpdate(
      { key: definition.key },
      { $set: payload },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    rolesMap[definition.key] = role;
  }

  logger.info('[seedRoles] Done');
  return rolesMap;
};

module.exports = seedRoles;
