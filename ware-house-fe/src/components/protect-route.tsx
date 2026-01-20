import dayjs from "dayjs";
import { Navigate, Outlet } from "react-router-dom";
import { AppRoutes } from "../router/routes";
import { useAppSelector } from "../store/hooks";
import { MainLayout } from "../layouts/main-layout";



export const GuestRoute = () => {
  const { token, expires } = useAppSelector(
    (state) => state.user.tokens.access
  );
  
  const isExpired = dayjs().isAfter(dayjs(expires));
  
  if (token && !isExpired) {
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
    return <Navigate to={AppRoutes.auth.login} replace />;
  }

  return <MainLayout />;
};
