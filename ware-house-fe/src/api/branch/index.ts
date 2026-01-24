import type { GetProductsRequestType } from "../../types/products";
import { keyQueryFilterString } from "../../utils/helper";
import AxiosClient from "../axiosClient";

export const getBranchsApi = async (payload: GetProductsRequestType) => {
  const queryString = keyQueryFilterString(payload)
  return  AxiosClient.get(`branch?${queryString}`);
};
