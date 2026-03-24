import type { CommonListResponse } from "../../types/common";
import { keyQueryFilterString } from "../../utils/helper";
import AxiosClient from "../axiosClient";

export const getInvoicesApi = async (payload: {
      limit: number;
    page: number;
}): Promise<CommonListResponse | any> => {
    const queryString = keyQueryFilterString(payload);
    return AxiosClient.get(`sale?${queryString}`);
};

export const createInvoiceApi = async (payload: {
    customerName: string, // Tên khách hàng
    branch: string, // id cửa hàng (FE tự động lấy trong thông tin user)
    warehouse: string, // id kho
    // supplier: 69a1cef6c6f2f045ec943acc,
    // deliveryPerson: bAJHN SÁNG,
    saleDate: Date, // ngày bán hàng (ko truyền thì sẽ hiện ngày hiện tại)
    note: string, // Ghi chú
    items: {
        product: string,
        quantity: number,
        price: number
    }[]
}) => {
    return AxiosClient.post(`sale`, payload);
};



export const deleteInvoiceApi = async (payload: { id: string }) => {
    return AxiosClient.delete(`supplier/${payload.id}`);
};
