import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { LoginPage } from "../pages/auth/login-page";
import { AppRoutes } from "./routes";
import { GuestRoute, PrivateRoute } from "../components/protect-route";
import { DashBoardPage } from "../pages/app/dardboard/dashboard";

export const RouterRoot = () => {
  const router = createBrowserRouter(
    [
      {
        path: AppRoutes.root,
        id: "root",
        element: <GuestRoute />,
        children: [
          {
          index: true,              // 👈 match "/"
          element: <LoginPage />,
        },
          {
            path: AppRoutes.auth.login,
                index: true,  
            element: <LoginPage />,
          },
        ],
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
        ],
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

  return <RouterProvider router={router} />;
};
