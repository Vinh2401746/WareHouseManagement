

import type { GetProductsRequestType } from "../../types/products";
import { keyQueryFilterString } from "../../utils/helper";
import AxiosClient from "../axiosClient";

export const getUnitsApi = async (payload: GetProductsRequestType) => {
  const queryString = keyQueryFilterString(payload)
  return  AxiosClient.get(`product/login?${queryString}`);
};
