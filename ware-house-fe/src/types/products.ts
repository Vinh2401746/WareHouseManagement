export type GetProductsRequestType = {
  name?: string;
  category?: string;
  unit?: string;
  minStock?: number;
  code?: string;
  limit: number;
  page: number;
  // sortBy: Joi.string(),
};

export type CreateProductRequestType = {
  code: string;
  name: string;
  category: string;
  unit: string;
  minStock: number;
  image?:object
};

export type UpdateProductRequestType = {
  productId: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  minStock: number;
};
