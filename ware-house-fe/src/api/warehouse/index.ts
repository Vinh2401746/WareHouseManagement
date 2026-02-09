import type { CommonListResponse } from "../../types/common";

import type { GetWarehousesRequestType,CreateWarehouseRequestType,UpdateWarehouseRequestType,DeleteWarehouseRequestType } from "../../types/warehouse";
import { keyQueryFilterString } from "../../utils/helper";
import AxiosClient from "../axiosClient";

export const getWarehousesApi = async (payload: GetWarehousesRequestType):Promise<CommonListResponse | any>  => {
  const queryString = keyQueryFilterString(payload);
  return AxiosClient.get(`warehouse?${queryString}`);
};

export const createWarehouseApi = async (payload: CreateWarehouseRequestType) => {
  return AxiosClient.post(`warehouse`, payload);
};

export const updateWarehousesApi = async (payload: UpdateWarehouseRequestType):Promise<CommonListResponse | any> => {
  const dataUpdate: Pick<
    UpdateWarehouseRequestType,
    "branch" | "name" | "address" 
  > = {
    name: payload.name,
    branch:payload.branch,
    address:payload.address
  };
  return AxiosClient.put(`warehouse/${payload.warehouseId}`, dataUpdate);
};

export const deleteWarehouseApi = async (payload: DeleteWarehouseRequestType) => {
  return AxiosClient.delete(`warehouse/${payload.warehouseId}` );
};
