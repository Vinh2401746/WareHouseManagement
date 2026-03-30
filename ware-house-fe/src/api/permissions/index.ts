import type { CommonListResponse } from "../../types/common";
import AxiosClient from "../axiosClient";

export const getPermissionsApi = async (): Promise<CommonListResponse | any> => {
  return AxiosClient.get(`permission?limit=1000`);
};
