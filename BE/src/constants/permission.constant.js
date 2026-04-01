const PERMISSION_DEFINITIONS = [
  {
    key: 'GET_USERS',
    code: 'getUsers',
    name: 'Xem người dùng',
    group: 'user',
    description: 'Cho phép xem danh sách và thông tin người dùng',
  },
  {
    key: 'MANAGE_USERS',
    code: 'manageUsers',
    name: 'Quản lý người dùng',
    group: 'user',
    description: 'Tạo, cập nhật, khoá hoặc xoá người dùng',
  },
  {
    key: 'GET_BRANCHES',
    code: 'getBranches',
    name: 'Xem chi nhánh',
    group: 'branches',
    description: 'Xem danh sách chi nhánh và chi tiết',
  },
  {
    key: 'MANAGE_BRANCHES',
    code: 'manageBranches',
    name: 'Quản lý chi nhánh',
    group: 'branches',
    description: 'Tạo mới, chỉnh sửa cấu hình chi nhánh',
  },
  {
    key: 'GET_WAREHOUSES',
    code: 'getWarehouses',
    name: 'Xem kho',
    group: 'warehouses',
    description: 'Đọc danh sách kho và thông tin chi tiết',
  },
  {
    key: 'MANAGE_WAREHOUSES',
    code: 'manageWarehouses',
    name: 'Quản lý kho',
    group: 'warehouses',
    description: 'Thêm, cập nhật, khoá kho hàng',
  },
  {
    key: 'GET_PRODUCTS',
    code: 'getProducts',
    name: 'Xem sản phẩm',
    group: 'products',
    description: 'Đọc danh sách sản phẩm và chi tiết',
  },
  {
    key: 'MANAGE_PRODUCTS',
    code: 'manageProducts',
    name: 'Quản lý sản phẩm',
    group: 'products',
    description: 'Tạo, chỉnh sửa, vô hiệu hoá sản phẩm',
  },
  {
    key: 'GET_PRODUCT_INVENTORY',
    code: 'getProductInventory',
    name: 'Xem tồn kho',
    group: 'productInventory',
    description: 'Xem báo cáo tồn kho tổng hợp/theo kho',
  },
  {
    key: 'GET_SUPPLIERS',
    code: 'getSuppliers',
    name: 'Xem nhà cung cấp',
    group: 'suppliers',
    description: 'Xem danh sách nhà cung cấp',
  },
  {
    key: 'MANAGE_SUPPLIERS',
    code: 'manageSuppliers',
    name: 'Quản lý nhà cung cấp',
    group: 'suppliers',
    description: 'Tạo hoặc cập nhật thông tin nhà cung cấp',
  },
  {
    key: 'GET_PRODUCT_BATCHS',
    code: 'getProductBatchs',
    name: 'Xem lô hàng',
    group: 'productBatchs',
    description: 'Xem danh sách lô hàng và chi tiết',
  },
  {
    key: 'MANAGE_PRODUCT_BATCHS',
    code: 'manageProductBatchs',
    name: 'Quản lý lô hàng',
    group: 'productBatchs',
    description: 'Tạo, cập nhật thông tin lô hàng',
  },
  {
    key: 'GET_INVENTORY_TRANSACTIONS',
    code: 'getInventoryTransactions',
    name: 'Xem phiếu kho',
    group: 'inventoryTransactions',
    description: 'Xem lịch sử nhập xuất kho',
  },
  {
    key: 'MANAGE_INVENTORY_TRANSACTIONS',
    code: 'manageInventoryTransactions',
    name: 'Quản lý phiếu kho',
    group: 'inventoryTransactions',
    description: 'Tạo mới, duyệt, chỉnh sửa phiếu kho',
  },
  {
    key: 'GET_SALES',
    code: 'getSales',
    name: 'Xem đơn bán',
    group: 'sales',
    description: 'Xem danh sách giao dịch bán hàng',
  },
  {
    key: 'MANAGE_SALES',
    code: 'manageSales',
    name: 'Quản lý đơn bán',
    group: 'sales',
    description: 'Tạo, cập nhật, huỷ đơn bán',
  },
  {
    key: 'GET_UNITS',
    code: 'getUnits',
    name: 'Xem đơn vị tính',
    group: 'units',
    description: 'Đọc danh sách đơn vị tính',
  },
  {
    key: 'MANAGE_UNITS',
    code: 'manageUnits',
    name: 'Quản lý đơn vị tính',
    group: 'units',
    description: 'Thêm/sửa/xoá đơn vị tính',
  },
  {
    key: 'MANAGE_PERMISSIONS',
    code: 'managePermissions',
    name: 'Quản lý quyền',
    group: 'rbac',
    description: 'Tạo và chỉnh sửa quyền động',
  },
  {
    key: 'MANAGE_ROLES',
    code: 'manageRoles',
    name: 'Quản lý vai trò',
    group: 'rbac',
    description: 'Tạo và chỉnh sửa vai trò động',
  },
  {
    key: 'GET_DASHBOARD',
    code: 'getDashboard',
    name: 'Xem Dashboard',
    group: 'dashboard',
    description: 'Cho phép truy cập xem dữ liệu phân tích biểu đồ màn hình chính',
  },
];

const PERMISSIONS = PERMISSION_DEFINITIONS.reduce((accumulator, definition) => {
  accumulator[definition.key] = definition.code;
  return accumulator;
}, {});



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
  SUPERADMIN: 'superadmin',
};

module.exports = {
  PERMISSIONS,
  PERMISSION_DEFINITIONS,
  ROLES,
};
