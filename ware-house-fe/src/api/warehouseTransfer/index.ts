import AxiosClient from "../axiosClient";
import { keyQueryFilterString } from "../../utils/helper";
import type {
  CancelWarehouseTransferRequest,
  CreateWarehouseTransferRequest,
  GetWarehouseTransfersRequest,
  WarehouseTransferListResponse,
  WarehouseTransferResponse,
} from "../../types/warehouseTransfer";

export const getWarehouseTransfersApi = async (
  payload: GetWarehouseTransfersRequest,
): Promise<WarehouseTransferListResponse> => {
  const queryString = keyQueryFilterString(payload);
  return AxiosClient.get(`warehouseTransfer?${queryString}`);
};

export const getWarehouseTransferByIdApi = async (id: string): Promise<WarehouseTransferResponse> => {
  return AxiosClient.get(`warehouseTransfer/${id}`);
};

export const createWarehouseTransferApi = async (
  payload: CreateWarehouseTransferRequest,
): Promise<WarehouseTransferResponse> => {
  return AxiosClient.post(`warehouseTransfer`, payload);
};

export const approveWarehouseTransferApi = async (id: string): Promise<WarehouseTransferResponse> => {
  return AxiosClient.patch(`warehouseTransfer/${id}/approve`);
};

export const cancelWarehouseTransferApi = async (
  id: string,
  payload: CancelWarehouseTransferRequest,
): Promise<WarehouseTransferResponse> => {
  return AxiosClient.put(`warehouseTransfer/${id}/cancel`, payload);
};
