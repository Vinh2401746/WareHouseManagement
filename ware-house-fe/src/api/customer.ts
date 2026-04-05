import AxiosClient from "./axiosClient";

export type Customer = {
  id: string;
  name: string;
  phone: string;
  address?: string;
  branch?: string;
  email?: string;
  note?: string;
  totalDebt: number;
};

export const getCustomersApi = async (params: any) => {
  const response = await AxiosClient.get<{
    results: Customer[];
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
  }>("/customer", { params });
  return response as any;
};

export const createCustomerApi = async (payload: Omit<Customer, "id" | "totalDebt">) => {
  const response = await AxiosClient.post<Customer>("/customer", payload);
  return response as any;
};

export const updateCustomerApi = async (id: string, payload: Partial<Customer>) => {
  const response = await AxiosClient.put<Customer>(`/customer/${id}`, payload);
  return response as any;
};

export const deleteCustomerApi = async (id: string) => {
  const response = await AxiosClient.delete(`/customer/${id}`);
  return response as any;
};

export const getCustomerByIdApi = async (id: string) => {
  const response = await AxiosClient.get<Customer>(`/customer/${id}`);
  return response as any;
};
