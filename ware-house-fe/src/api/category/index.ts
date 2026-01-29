import type {
  GetCategoriesRequestType,
  PostCategoryType,
  UpdatetCategoryType,
} from "../../types/category";
import type { CommonListResponse } from "../../types/common";
import { keyQueryFilterString } from "../../utils/helper";
import AxiosClient from "../axiosClient";

export const getCategorysApi = async (payload: GetCategoriesRequestType):Promise<CommonListResponse | any>  => {
  const queryString = keyQueryFilterString(payload);
  return AxiosClient.get(`category?${queryString}`);
};

export const deleteCategory = async (payload: any): Promise<any> => {
  if (!payload.id) throw "Không tìm thấy category";
  return AxiosClient.delete(`category/${payload?.id}`);
};

export const createCategory = async (
  payload: PostCategoryType,
): Promise<any> => {
  return AxiosClient.post(`category`, payload);
};

export const updateCategory = async (
  payload: UpdatetCategoryType,
): Promise<any> => {
    // console.log("updateCategory", payload);
    
  const dataUpdate: Pick<UpdatetCategoryType, "name" | "code"> = {
    code: payload.code,
    name: payload.name,
  };
  if (!payload.categoryId) throw "Không tìm thấy category";

  return AxiosClient.put(`category/${payload?.categoryId}`, dataUpdate);
};
