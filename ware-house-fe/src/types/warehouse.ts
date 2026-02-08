export type GetWarehousesRequestType = {
  name?: string;
  branch?: string;
  address?: string;
  sortBy?:string
  limit: number;
  page: number;
  // sortBy: Joi.string(),
};

export type CreateWarehouseRequestType = {
  name: string;
  branch: string;
  address: string;
};

export type UpdateWarehouseRequestType = {
  warehouseId: string;
  name: string;
  branch: string;
  address: string;
};

export type DeleteWarehouseRequestType = {
  warehouseId: string;
};

