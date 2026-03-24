import Loadable from "../layouts/sysnc/loadable";
import { lazy } from "react";

import { createBrowserRouter } from "react-router-dom";
import { AppRoutes } from "./routes";
import { GuestRoute, PrivateRoute } from "../components/protect-route";
import NoPermissonPage from "../pages/404-developing/no-permission";
import WarehouseImportExportDetailPage from "../pages/app/warehouse_import_export/detail";
import SalePage from "../pages/app/sales";
import { CreateInvoicePage } from "../pages/app/sales/create_invoice";


const LoginPage = Loadable(lazy(() => import('../pages/auth/login-page')));
const UserPage = Loadable(lazy(() => import('../pages/app/users')));
const DashBoardPage = Loadable(lazy(() => import('../pages/app/dardboard/dashboard')));
const NotFoundPage = Loadable(lazy(() => import('../pages/404-developing/index')));
const DevelopingPage = Loadable(lazy(() => import('../pages/404-developing/developing')));
const ForgotPasswordPage = Loadable(lazy(() => import('../pages/auth/forgot-pass')));
const SettingPasswordPage = Loadable(lazy(() => import('../pages/auth/setting-password')));
const ProductsPage = Loadable(lazy(() => import('../pages/app/products')));
const CategoryPage = Loadable(lazy(() => import('../pages/app/category')));
const SuppilerPage = Loadable(lazy(() => import('../pages/app/suppiler')));
const UnitPage = Loadable(lazy(() => import('../pages/app/unit')));
const WarehousePage = Loadable(lazy(() => import('../pages/app/warehouse')));
const BranchPage = Loadable(lazy( async () => import('../pages/app/branch')));
const WarehouseImportAndExport = Loadable(lazy( async () => import('../pages/app/warehouse_import_export')));
export const router = createBrowserRouter(
  [
    {
      path: AppRoutes.root,
      id: "root",
      element: <GuestRoute />,
      children: [
        {
          // path: AppRoutes.auth.login,
          index: true,
          element: <LoginPage />,
        },
        {
          path: AppRoutes.auth.forgot_pass,
          element: <ForgotPasswordPage />,
        },
        {
          path: AppRoutes.auth.setting_pass,
          element: <SettingPasswordPage />,
        },
      ],
      errorElement: <NotFoundPage />,
    },
    {
      id: "authented",
      element: <PrivateRoute />,
      children: [
        {
          path: AppRoutes.home.dashboard,
          id: AppRoutes.home.dashboard,
          element: <DashBoardPage />,
        },
        {
          path: AppRoutes.user.list,
          id: AppRoutes.user.list,
          element: <UserPage />,
        },
        {
          path: AppRoutes.products,
          id: AppRoutes.products,
          element: <ProductsPage />,
        },
        {
          path: AppRoutes.category,
          id: AppRoutes.category,
          element: <CategoryPage />,
        },
        {
          path: AppRoutes.supplier,
          id: AppRoutes.supplier,
          element: <SuppilerPage />,
        },
        {
          path: AppRoutes.warehouse.list,
          id: AppRoutes.warehouse.list,
          element: <WarehousePage />,
        },
        {
          path: AppRoutes.store,
          id: AppRoutes.store,
          element: <DevelopingPage />,
        },
        {
          path: AppRoutes.warehouse_import_export,
          id: AppRoutes.warehouse_import_export,
          element: <WarehouseImportAndExport />,
        },
           {
          path: AppRoutes.warehouse_import_export_detail,
          id: AppRoutes.warehouse_import_export_detail,
          element: <WarehouseImportExportDetailPage />,
        },
        {
          path: AppRoutes.sales_invoice,
          id: AppRoutes.sales_invoice,
          element: <SalePage />,
        },
         {
          path: AppRoutes.create_invoice,
          id: AppRoutes.create_invoice,
          element: <CreateInvoicePage />,
        },
        {
          path: AppRoutes.unit.list,
          id: AppRoutes.unit.list,
          element : <UnitPage />
        },
          {
          path: AppRoutes.branch.list,
          id: AppRoutes.branch.list,
          element : <BranchPage />
        },
           {
          path: AppRoutes.no_permisson,
          id: AppRoutes.no_permisson,
          element : <NoPermissonPage />
        }
      ],
      errorElement: <NotFoundPage />,
    },
  ],
  {
    hydrationData: {
      loaderData: {
        root: "ROOT DATA",
        // No index data provided
      },
    },
  },
);
