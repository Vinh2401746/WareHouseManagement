const { ROLES } = require('../constants/permission.constant');

const extractPermissionCodes = (permissions = []) => {
  return permissions.filter((permission) => permission && permission.code).map((permission) => permission.code);
};

const formatPermissionsByGroup = (permissions = []) => {
  return permissions.reduce((accumulator, permission) => {
    if (!permission || !permission.code) {
      return accumulator;
    }
    const groupKey = permission.group || 'others';
    if (!accumulator[groupKey]) {
      accumulator[groupKey] = [];
    }
    accumulator[groupKey].push(permission.code);
    return accumulator;
  }, {});
};

const isSuperAdminRole = (role) => role && role.key === ROLES.SUPERADMIN;

const isGlobalRole = (role) => role && role.scope === 'global';

module.exports = {
  extractPermissionCodes,
  formatPermissionsByGroup,
  isSuperAdminRole,
  isGlobalRole,
};
