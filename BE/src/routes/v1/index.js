const express = require('express');
const testRoute = require('./test.route');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const branchRoute = require('./branch.route');
const warehouseRoute = require('./warehouse.route');
const productRoute = require('./product.route');
const supplierRoute = require('./supplier.route');
const permissionRoute = require('./permission.route');
const roleRoute = require('./role.route');
const docsRoute = require('./docs.route');
const productBatchRoute = require('./productBatch.route');
const unitRoute = require('./unit.route');
const inventoryTransactionRoute = require('./inventoryTransaction.route');
const saleRoute = require('./sale.route');
const customerRoute = require('./customer.route');
const dashboardRoute = require('./dashboard.route');
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/test',
    route: testRoute,
  },
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/branch',
    route: branchRoute,
  },
  {
    path: '/warehouse',
    route: warehouseRoute,
  },
  {
    path: '/product',
    route: productRoute,
  },
  {
    path: '/supplier',
    route: supplierRoute,
  },
  {
    path: '/productBatch',
    route: productBatchRoute,
  },
  {
    path: '/inventory',
    route: inventoryTransactionRoute,
  },
  {
    path: '/sale',
    route: saleRoute,
  },
  {
    path: '/unit',
    route: unitRoute,
  },
  {
    path: '/permission',
    route: permissionRoute,
  },
  {
    path: '/role',
    route: roleRoute,
  },
  {
    path: '/customer',
    route: customerRoute,
  },
  {
    path: '/dashboard',
    route: dashboardRoute,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
