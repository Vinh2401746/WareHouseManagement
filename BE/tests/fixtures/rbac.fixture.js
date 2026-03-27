const { Permission, Role } = require('../../src/models');
const { PERMISSION_DEFINITIONS, ROLES } = require('../../src/constants/permission.constant');
const { ROLE_DEFINITIONS } = require('../../src/config/roles');

const buildPermissionPayloads = () =>
  PERMISSION_DEFINITIONS.map((definition) => ({
    code: definition.code,
    name: definition.name,
    group: definition.group || null,
    description: definition.description || '',
    isSystem: true,
  }));

const buildRolePayloads = (permissionMap) =>
  ROLE_DEFINITIONS.map((definition) => ({
    name: definition.name,
    key: definition.key,
    description: definition.description || '',
    permissions: (definition.permissions || [])
      .map((code) => (permissionMap[code] ? permissionMap[code]._id : null))
      .filter(Boolean),
    scope: definition.scope,
    isSystem: definition.isSystem !== false,
    isImmutable: Boolean(definition.isImmutable),
  }));

const ensurePermissionsSeeded = async () => {
  let permissions = await Permission.find({});
  if (permissions.length === 0) {
    permissions = await Permission.insertMany(buildPermissionPayloads());
  }
  return permissions.reduce((accumulator, permission) => {
    accumulator[permission.code] = permission;
    return accumulator;
  }, {});
};

const ensureRolesSeeded = async () => {
  const permissionMap = await ensurePermissionsSeeded();
  let roles = await Role.find({});
  if (roles.length === 0) {
    roles = await Role.insertMany(buildRolePayloads(permissionMap));
  }
  return roles.reduce((accumulator, role) => {
    accumulator[role.key] = role;
    return accumulator;
  }, {});
};

const getRoleByKey = async (roleKey) => {
  const roleMap = await ensureRolesSeeded();
  return roleMap[roleKey];
};

module.exports = {
  ensurePermissionsSeeded,
  ensureRolesSeeded,
  getRoleByKey,
  ROLES,
};
