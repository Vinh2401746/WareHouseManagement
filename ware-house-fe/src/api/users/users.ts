import type { roles } from "../../types/auth";
import type { UpdateUserType } from "../../types/user";
import AxiosClient from "../axiosClient";

export const getUsers = async (payload: {
  page: number;
  limit: number;
}): Promise<{
  limit: number;
  page: number;
  results: any[];
  totalPages: number;
  totalResults: number;
}> => {
  const queryString = `?page=${payload.page}&limit=${payload.limit}`;
  return AxiosClient.get(`users${queryString}`);
};

export const createUser = async (payload: {
  email: string;
  password: string;
  name: string;
  role: roles;
}): Promise<any> => {
  return AxiosClient.post(`users`, payload);
};

export const updateUser = async (payload: UpdateUserType): Promise<any> => {
  const dataUpdate: Pick<UpdateUserType, "email" | "password" | "name" | "role" > = {
    email:payload.email,
    password:payload.password,
    name:payload.name,
    role :payload.role
  };
  console.log("dataUpte", dataUpdate);
  
  if (!payload.id) throw "Không tìm thấy user";

  return AxiosClient.patch(`users/${payload?.id}`, dataUpdate);
};

export const deleteUser = async (payload: any): Promise<any> => {
  if (!payload.id) throw "Không tìm thấy user";
  return AxiosClient.delete(`users/${payload?.id}`);
};
