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
    'getProducts',
    'manageProducts',
    'getSuppliers',
    'manageSuppliers',
  ],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
