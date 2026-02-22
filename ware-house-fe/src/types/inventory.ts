export type CreateInventoryRequest = {
  type: string;
  reason: string;
  warehouse: string;
  supplier: string;
  sale: string;
  createdBy: string;
  transactionDate: Date;
  items: string;
};

export type GetInventoriesRequest = {
  type: "IMPORT" | "EXPORT";
  reason?: string;
  warehouse?: string;
  supplier?: string;
  sale?: string;
  createdBy?: string;
  transactionDate?: Date;
  deliveryPerson?: string;
  sortBy?: string;
  limit: string;
  page: string;
};
