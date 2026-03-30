import type { CommonListResponse } from "../../types/common";
import type { DeleteRoleRequestType, GetRolesRequestType, PostRoleType, UpdateRoleType } from "../../types/role";
import { keyQueryFilterString } from "../../utils/helper";
import AxiosClient from "../axiosClient";

export const getRolesApi = async (payload: GetRolesRequestType): Promise<CommonListResponse | any> => {
  const queryString = keyQueryFilterString(payload);
  return AxiosClient.get(`role?${queryString}`);
};

export const createRoleApi = async (payload: PostRoleType) => {
  return AxiosClient.post(`role`, payload);
};

export const updateRoleApi = async (payload: UpdateRoleType) => {
  const { id, ...dataUpdate } = payload;
  return AxiosClient.patch(`role/${id}`, dataUpdate);
};

export const deleteRoleApi = async (payload: DeleteRoleRequestType) => {
  return AxiosClient.delete(`role/${payload.id}`);
};

export const getRoleByIdApi = async (payload: { id: string }) => {
  return AxiosClient.get(`role/${payload.id}`);
};
