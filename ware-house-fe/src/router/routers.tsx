import { createBrowserRouter } from "react-router-dom";
import { AppRoutes } from "./routes";
import { GuestRoute, PrivateRoute } from "../components/protect-route";
import { LoginPage } from "../pages/auth/login-page";
import { UserPage } from "../pages/app/users";
import { DashBoardPage } from "../pages/app/dardboard/dashboard";
import NotFoundPage from "../pages/404-developing";
import DevelopingPage from "../pages/404-developing/developing";
import { ForgotPasswordPage } from "../pages/auth/forgot-pass";
import { SettingPasswordPage } from "../pages/auth/setting-password";
import { ProductsPage } from "../pages/app/products";

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
          path: AppRoutes.unit,
          id: AppRoutes.unit,
          element: <DevelopingPage />,
        },
        {
          path: AppRoutes.supplier,
          id: AppRoutes.supplier,
          element: <DevelopingPage />,
        },
        {
          path: AppRoutes.warehouse,
          id: AppRoutes.warehouse,
          element: <DevelopingPage />,
        },
        {
          path: AppRoutes.store,
          id: AppRoutes.store,
          element: <DevelopingPage />,
        },
        {
          path: AppRoutes.invoice_import_export,
          id: AppRoutes.invoice_import_export,
          element: <DevelopingPage />,
        },
        {
          path: AppRoutes.sales_invoice,
          id: AppRoutes.sales_invoice,
          element: <DevelopingPage />,
        },
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
