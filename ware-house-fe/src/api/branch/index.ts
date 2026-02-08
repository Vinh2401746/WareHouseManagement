import type { CommonListResponse } from "../../types/common";
import type { GetProductsRequestType } from "../../types/products";
import { keyQueryFilterString } from "../../utils/helper";
import AxiosClient from "../axiosClient";

export const getBranchsApi = async (payload: GetProductsRequestType) :Promise<CommonListResponse | any> => {
  const queryString = keyQueryFilterString(payload)
  return  AxiosClient.get(`branch?${queryString}`);
};
