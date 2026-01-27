export type GetCategoriesRequestType = {
  code?: string;
  name?: string;
  sortBy?: string;
  limit: number;
  page: number;
  // sortBy: Joi.string(),
};


export type PostCategoryType = {
     code: string,
    name: string,
}



export type UpdatetCategoryType = {
    categoryId:string,
     code: string,
    name: string,
}
