
import type { CommonListResponse } from "../../types/common";
import type { CreateInventoryRequest, GetInventoriesRequest } from "../../types/inventory";
import type {
  UpdateProductRequestType,
} from "../../types/products";
import { keyQueryFilterString } from "../../utils/helper";
import AxiosClient from "../axiosClient";

export const getInventoriesApi = async (payload: GetInventoriesRequest): Promise<CommonListResponse | any> => {
  const queryString = keyQueryFilterString(payload);
  return AxiosClient.get(`inventory?${queryString}`);
};

export const createInventoriesApi = async (payload: CreateInventoryRequest) => {
  return AxiosClient.post(`inventory/import`, payload);
};


export const comfirmInventoryApi = async (payload: { id: string }) => {
  console.log("payload", payload)
  if (!payload.id) throw Error("Không tìm thấy đơn duyệt")
  return AxiosClient.patch(`inventory/import/${payload.id}/confirm`);
};





export const deleteProductApi = async (payload: { id: string }) => {
  return AxiosClient.delete(`product/${payload.id}`);
};

export const getAnInventoryApi = async (payload: { id: string }): Promise<any> => {
  return AxiosClient.get(`inventory/${payload.id}`);
};

export const updateAnInventoryApi = async (payload: {
  id: string,
  data: any
}) => {
  return AxiosClient.put(`import/${payload.id}`, payload.data)
}

