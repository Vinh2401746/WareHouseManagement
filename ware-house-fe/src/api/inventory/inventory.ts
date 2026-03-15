
import type { CommonListResponse } from "../../types/common";
import type { CreateInventoryRequest, GetInventoriesRequest } from "../../types/inventory";
import type {
  UpdateProductRequestType,
} from "../../types/products";
import { keyQueryFilterString } from "../../utils/helper";
import AxiosClient from "../axiosClient";

export const getInventoriesApi = async (payload: GetInventoriesRequest):Promise<CommonListResponse | any>  => {
  const queryString = keyQueryFilterString(payload);
  return AxiosClient.get(`inventory?${queryString}`);
};

export const createInventoriesApi = async (payload: CreateInventoryRequest) => {
  return AxiosClient.post(`inventory/import`, payload);
};


export const comfirmInventoryApi = async (payload: {id:string}) => {
  console.log("payload", payload)
  if(!payload.id) throw Error("Không tìm thấy đơn duyệt")
  return AxiosClient.patch(`inventory/import/${payload.id}/confirm`);
};



export const updateProductsApi = async (payload: UpdateProductRequestType):Promise<CommonListResponse | any> => {
  const dataUpdate: Pick<
    UpdateProductRequestType,
    "code" | "name" | "category" | "unit" | "minStock"
  > = {
    code: payload.code,
    name: payload.name,
    category: payload.category,
    unit: payload.unit,
    minStock: payload.minStock,
  };
  return AxiosClient.put(`product/${payload.productId}`, dataUpdate);
};

export const deleteProductApi = async (payload: { id: string }) => {
  return AxiosClient.delete(`product/${payload.id}` );
};
