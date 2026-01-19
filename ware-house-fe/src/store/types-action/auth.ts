export const AuthAction = {
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
} as const;

export const loginAction = (payload: { email: string; password: string }) => ({
  type: AuthAction.LOGIN,
  payload,
});
