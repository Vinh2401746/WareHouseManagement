const allRoles = {
  user: ['getUsers', 'manageUsers', 'manageBranches', 'getBranches'],
  admin: [
    'getUsers',
    'manageUsers',
    'manageBranches',
    'getBranches',
    'getWarehouses',
    'manageWarehouses',
    'manageCategories',
    'getCategories',
  ],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
