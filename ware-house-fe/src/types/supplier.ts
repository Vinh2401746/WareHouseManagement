export type PostSupplierRequestType = {
  name: string;
  phone: string;
  email: string;
  address: string;
};

export type GetSuppliersRequestType = {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  sortBy?: string;
  limit: number;
  page: number;
};

export type GetSupplierRequestType = {
  productId: string;
};

export type UpdateSupplierRequestType = {
  supplierId: string;
  name: string;
  phone: string;
  email: string;
  address: string;
};

export type DeleteSupplierRequestType = {
  productId: string;
};
