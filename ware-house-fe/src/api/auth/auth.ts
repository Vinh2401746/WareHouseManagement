import type { AuthRequestLoginType } from "../../types/auth";
import AxiosClient from "../axiosClient";

export const authLoginApi = async (payload: AuthRequestLoginType) => {
  return await AxiosClient.post("auth/login",payload);
};

export const authLogoutApi = async () => {
  return await AxiosClient.post("auth/logout");
};

export const authResetPasswordApi = async (payload:{
  token:string,
  password:string
}) => {
  return await AxiosClient.post(`auth/reset-password?token=${payload.token}`,{
    password: payload.password
  });
};
