import type { PostBranchType, GetBranchsRequestType,DeleteBranchReuestType, UpdateBranchType } from "../../types/branch";
import type { CommonListResponse } from "../../types/common";
import { keyQueryFilterString } from "../../utils/helper";
import AxiosClient from "../axiosClient";

export const getBranchsApi = async (payload: GetBranchsRequestType) :Promise<CommonListResponse | any> => {
  const queryString = keyQueryFilterString(payload)
  return  AxiosClient.get(`branch?${queryString}`);
};


export const createBranchApi = async (payload: PostBranchType) => {
  return AxiosClient.post(`branch`, payload);
};

export const updateBranchApi = async (payload: UpdateBranchType) => {
  
  const dataUpdate: Pick<
  UpdateBranchType,
  "phone" | "name"  | "address"
  > = {
    phone:payload.phone,
    name:payload.name,
    address:payload.address,
  };

  return AxiosClient.put(`branch/${payload.branchId}`, dataUpdate);
};

export const deleteBranchApi = async (payload: DeleteBranchReuestType) => {
  return AxiosClient.delete(`branch/${payload.branchId}`);
};
