const PERMISSIONS = {
  GET_USERS: 'getUsers',
  MANAGE_USERS: 'manageUsers',
  GET_BRANCHES: 'getBranches',
  MANAGE_BRANCHES: 'manageBranches',
  GET_WAREHOUSES: 'getWarehouses',
  MANAGE_WAREHOUSES: 'manageWarehouses',
  GET_CATEGORIES: 'getCategories',
  MANAGE_CATEGORIES: 'manageCategories',
  GET_PRODUCTS: 'getProducts',
  MANAGE_PRODUCTS: 'manageProducts',
  GET_SUPPLIERS: 'getSuppliers',
  MANAGE_SUPPLIERS: 'manageSuppliers',
  GET_PRODUCT_BATCHS: 'getProductBatchs',
  MANAGE_PRODUCT_BATCHS: 'manageProductBatchs',
  GET_INVENTORY_TRANSACTIONS: 'getInventoryTransactions',
  MANAGE_INVENTORY_TRANSACTIONS: 'manageInventoryTransactions',
  GET_SALES: 'getSales',
  MANAGE_SALES: 'manageSales',
  GET_UNITS: 'getUnits',
  MANAGE_UNITS: 'manageUnits',
};

const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  WAREHOUSE_STAFF: 'warehouseStaff',
  STORE_KEEPER: 'storeKeeper',
  WAREHOUSE_MANAGER: 'warehouseManager',
  PURCHASING_STAFF: 'purchasingStaff',
  SALES_STAFF: 'salesStaff',
  ACCOUNTANT: 'accountant',
  SYSTEM_ADMIN: 'systemAdmin',
};

module.exports = {
  PERMISSIONS,
  ROLES,
};
