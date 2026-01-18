import { memo } from "react";
import { useAppDispatch } from "../../store/hooks";
import { loginRequest } from "../../store/toolkit/auth";

export const LoginPage = memo(() => {
    console.log("loginPages");
    
  const dispatch = useAppDispatch();
  const dispatchLogin = () => {
    dispatch(
      loginRequest({
        email: "admin@gmail.com",
        password: "admin123",
      }),
    );
  };
  return (
    <div>
      Login Page
      <button onClick={dispatchLogin}>loginSaga</button>
    </div>
  );
});
