import { memo } from "react";
import { logoutRequest } from "../../../store/toolkit/auth";
import { useAppDispatch } from "../../../store/hooks";

export const DashBoardPage = memo(() => {
  const dispatch = useAppDispatch();
  const dispatchLogout = () => {
    dispatch(logoutRequest());
  };
  return (
    <span>
       DashBoardPage
      <button onClick={dispatchLogout}>loginSaga</button>
    </span>
  );
});
