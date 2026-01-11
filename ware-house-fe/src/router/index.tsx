import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { LoginPage } from "../pages/auth/login-page";

export const RouterRoot = () => {
  const router = createBrowserRouter(
    [
      {
        path: "/login",
        id: "root",
        element: <LoginPage />,
        //   children: [
        //     {
        //       id: "index",
        //       loader: indexLoader,
        //       HydrateFallback: IndexSkeleton,
        //       Component: Index,
        //     },
        //   ],
      },
    ],
    {
      hydrationData: {
        loaderData: {
          root: "ROOT DATA",
          // No index data provided
        },
      },
    }
  );

  return <RouterProvider router={router} />;
};
