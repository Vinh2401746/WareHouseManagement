const express = require('express');
const testRoute = require('./test.route');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const branchRoute = require('./branch.route');
const warehouseRoute = require('./warehouse.route');
const categoryRoute = require('./category.route');
const productRoute = require('./product.route');
const docsRoute = require('./docs.route');
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
    path: '/category',
    route: categoryRoute,
  },
  {
    path: '/product',
    route: productRoute,
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
