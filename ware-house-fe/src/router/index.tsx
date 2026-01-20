import { RouterProvider } from "react-router-dom";

import { router } from "./routers";


export const RouterRoot = () => {
  return <RouterProvider router={router} />;
};
