import type { CommonListResponse } from "../../types/common";
import type {
  CreateProductRequestType,
  GetProductsRequestType,
  UpdateProductRequestType,
} from "../../types/products";
import { keyQueryFilterString } from "../../utils/helper";
import AxiosClient from "../axiosClient";

export const getProductsApi = async (payload: GetProductsRequestType):Promise<CommonListResponse | any>  => {
  const queryString = keyQueryFilterString(payload);
  return AxiosClient.get(`product?${queryString}`);
};

export const createProductApi = async (payload: CreateProductRequestType) => {
  return AxiosClient.post(`product`, payload);
};

export const updateProductsApi = async (payload: UpdateProductRequestType):Promise<CommonListResponse | any> => {
  const dataUpdate: Pick<
    UpdateProductRequestType,
    "code" | "name" | "category" | "unit" | "minStock"
  > = {
    ...payload,
  };
  return AxiosClient.put(`product/${payload.productId}`, dataUpdate);
};
