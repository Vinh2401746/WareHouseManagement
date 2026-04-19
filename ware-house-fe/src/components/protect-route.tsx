import dayjs from "dayjs";
import { Navigate, Outlet } from "react-router-dom";
import { AppRoutes } from "../router/routes";
import { useAppSelector } from "../store/hooks";
import { MainLayout } from "../layouts/main-layout";
import type { PropsWithChildren } from "react";
import NoPermissonPage from "../pages/404-developing/no-permission";



export const GuestRoute = () => {
  const { token, expires } = useAppSelector(
    (state) => state.user.tokens.access
  );
  
  const isExpired = dayjs().isAfter(dayjs(expires));
  if (token &&  !isExpired) {
    return <Navigate to={AppRoutes.home.dashboard} replace />;
  }

  return <Outlet />;
};

export const PrivateRoute = () => {
  const { token, expires } = useAppSelector(
    (state) => state.user.tokens.access
  );
  const isExpired = dayjs().isAfter(dayjs(expires));

  if (!token || isExpired) {
    return <Navigate to={AppRoutes.root} replace />;
  }

  return <MainLayout />;
};

export const SuperAdminRoute = ({ children }: PropsWithChildren) => {
  const roleKey = useAppSelector((state: any) => state.user?.user?.roleKey);
  const isSuperAdmin = String(roleKey || "").trim().toLowerCase() === "superadmin";

  if (!isSuperAdmin) {
    return <NoPermissonPage />;
  }

  return <>{children}</>;
};
