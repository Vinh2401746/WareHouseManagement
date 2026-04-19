export type WarehouseTransferStatus =
  | "PENDING"
  | "APPROVED"
  | "COMPLETED"
  | "CANCELLED"
  | string;

export type WarehouseTransferItemRequest = {
  product: string;
  quantity: number;
  batch?: string | null;
};

export type CreateWarehouseTransferRequest = {
  sourceWarehouse: string;
  destinationWarehouse: string;
  reason?: string;
  note?: string;
  items: WarehouseTransferItemRequest[];
};

export type CancelWarehouseTransferRequest = {
  cancelReason?: string;
};

export type GetWarehouseTransfersRequest = {
  page: number;
  limit: number;
  status?: WarehouseTransferStatus;
  keyword?: string;
  sortBy?: string;
};

export type WarehouseTransferResponse = any;

export type WarehouseTransferListResponse = {
  results: WarehouseTransferResponse[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
};
