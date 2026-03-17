export type CreateInventoryRequest = {
  reason: string;
  warehouse: string;
  supplier: string;
  deliveryPerson:string
  items: string;
  discountMoney:number;
  taxMoney:number;
  totalAmount:number;
  totalAmountAfterFax:number
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
