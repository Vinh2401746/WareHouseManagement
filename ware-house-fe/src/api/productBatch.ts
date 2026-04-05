import AxiosClient from "./axiosClient";

export type ProductBatchType = {
  id: string;
  batchCode: string;
  product: {
    id: string;
    code: string;
    name: string;
    imageUrl?: string;
  };
  warehouse: {
    id: string;
    name: string;
  };
  quantity: number;
  importPrice: number;
  manufactureDate: string;
  expiryDate: string;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedBatchesResponse = {
  results: ProductBatchType[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
};

export type GetBatchesParams = {
  keyword?: string;
  status?: "EXPIRED" | "EXPIRING" | "VALID";
  stockStatus?: "AVAILABLE" | "EMPTY";
  warehouse?: string;
  product?: string;
  page: number;
  limit: number;
  sortBy?: string;
};

export const getProductBatchesApi = async (params: GetBatchesParams) => {
  const response = await AxiosClient.get<PaginatedBatchesResponse>("/productBatch", { params });
  return response as unknown as PaginatedBatchesResponse;
};

export const updateProductBatchApi = async (id: string, payload: { expiryDate: string }) => {
  const response = await AxiosClient.put<ProductBatchType>(`/productBatch/${id}`, payload);
  return response as unknown as ProductBatchType;
};
