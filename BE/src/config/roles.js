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
    'manageProductBatchs',
    'getProductBatchs',
    'manageInventoryTransactions',
    'getInventoryTransactions',
    'manageSales',
    'getSales',
    'manageUnits',
    'getUnits',
  ],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
