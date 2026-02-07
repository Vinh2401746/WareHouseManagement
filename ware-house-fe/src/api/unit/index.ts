import type {
GetUnitRequestType, PostunitType, UpdateUnitType, DeleteUnitType
} from "../../types/unit";
import type { CommonListResponse } from "../../types/common";
import { keyQueryFilterString } from "../../utils/helper";
import AxiosClient from "../axiosClient";

export const getUnitsApi = async (payload: GetUnitRequestType):Promise<CommonListResponse | any>  => {
  const queryString = keyQueryFilterString(payload);
  return AxiosClient.get(`unit?${queryString}`);
};

export const deleteUnit = async (payload: DeleteUnitType): Promise<any> => {
  if (!payload.unitId) throw "Không tìm thấy đơn vị";
  return AxiosClient.delete(`unit/${payload?.unitId}`);
};

export const createUnit = async (
  payload: PostunitType,
): Promise<any> => {
  return AxiosClient.post(`unit`, payload);
};

export const updateUnit = async (
  payload: UpdateUnitType,
): Promise<any> => {
    // console.log("updateunit", payload);
    
  const dataUpdate: Pick<UpdateUnitType, "name" | "code"> = {
    code: payload.code,
    name: payload.name,
  };
  if (!payload.unitId) throw "Không tìm thấy đơn vị";

  return AxiosClient.patch(`unit/${payload?.unitId}`, dataUpdate);
};
