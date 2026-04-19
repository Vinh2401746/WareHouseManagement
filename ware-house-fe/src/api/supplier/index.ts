import type { CommonListResponse } from "../../types/common";
import type {
  PostSupplierRequestType,
  UpdateSupplierRequestType,
  GetSuppliersRequestType,
} from "../../types/supplier";
import { keyQueryFilterString } from "../../utils/helper";
import AxiosClient from "../axiosClient";

export const getSuppliersApi = async (payload: GetSuppliersRequestType) :Promise<CommonListResponse | any> => {
  const queryString = keyQueryFilterString(payload);
  return AxiosClient.get(`supplier?${queryString}`);
};

export const createSuppliersApi = async (payload: PostSupplierRequestType) => {
  return AxiosClient.post(`supplier`, payload);
};

export const updateSupplierApi = async (payload: UpdateSupplierRequestType) => {
  
  const dataUpdate: Pick<
  UpdateSupplierRequestType,
  "phone" | "name" | "email" | "address"
  > = {
    phone:payload.phone,
    name:payload.name,
    email:payload.email,
    address:payload.address,
  };

  return AxiosClient.put(`supplier/${payload.supplierId}`, dataUpdate);
};

export const deleteSuplierApi = async (payload: { id: string }) => {
  return AxiosClient.delete(`supplier/${payload.id}`);
};

export const getTemplateSupplier = () => {
  return AxiosClient.get(`supplier/import-template`, { responseType: 'blob' });
};

export const importTemplateSupplier = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return AxiosClient.post(`supplier/import`, formData);
};

export const exportCurrentSuppliers = () => {
  return AxiosClient.get(`supplier/export`, { responseType: 'blob' });
};
