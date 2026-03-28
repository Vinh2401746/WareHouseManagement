import type { CommonListResponse } from "../../types/common";
import type {
  CreateProductRequestType,
  GetProductsRequestType,
  UpdateProductRequestType,
} from "../../types/products";
import { keyQueryFilterString } from "../../utils/helper";
import AxiosClient from "../axiosClient";

export const getProductsApi = async (payload: GetProductsRequestType): Promise<CommonListResponse | any> => {
  const queryString = keyQueryFilterString(payload);
  return AxiosClient.get(`product?${queryString}`);
};

export const createProductApi = async (payload: CreateProductRequestType) => {
  const formData = new FormData();
  formData.append("code", payload.code);
  formData.append("name", payload.name);
  formData.append("unit", payload.unit);
  formData.append("minStock", String(payload.minStock));
  if (payload.image) formData.append("image", (payload.image) as File);
  return AxiosClient.post(`product`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const updateProductsApi = async (payload: UpdateProductRequestType): Promise<CommonListResponse | any> => {
  const formData = new FormData();
  formData.append("code", payload.code);
  formData.append("name", payload.name);
  formData.append("unit", payload.unit);
  formData.append("minStock", String(payload.minStock));
  if (payload.image) formData.append("image", (payload.image) as File);
  return AxiosClient.put(`product/${payload.productId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteProductApi = async (payload: { id: string }) => {
  return AxiosClient.delete(`product/${payload.id}`);
};


export const getTemplateProduct = () => {
  return AxiosClient.get(`product/import-template`, { responseType: 'blob' });
}

export const importTemplateProduct = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return AxiosClient.post(`product/import`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const exportCurrentExProduct = () => {
  return AxiosClient.get(`product/export`, { responseType: 'blob' });
}

export const getInventoryProduct = () =>{
   return AxiosClient.get(`product/inventory-overview`);
}