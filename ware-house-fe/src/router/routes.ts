export const AppRoutes = {
  root : '/',
  auth:{
    login :'/login',
    forgot_pass :'/forgot-pass',
    setting_pass : '/setting-pass'
  },
  home:{
    dashboard: '/dashboard'
  },
  user:{
    list:"/users"
  },
  products: '/products',
  category: '/category',
  supplier: '/supplier',
  warehouse: {
    list: '/warehouse'
  },
  store: '/store',
  warehouse_import_export: '/warehouse_import_export',
  warehouse_import_export_detail: '/warehouse_import_export_detail',
  sales_invoice: '/sales_invoice',
  unit:{
    list:'/unit'
  },
  branch: {
    list: '/branch'
  },
  no_permisson:'/no_permisson'
};
