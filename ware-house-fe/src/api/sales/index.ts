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
    customerName?: string,
    customer?: string, 
    branch: string,
    warehouse: string,
    saleDate: Date,
    note?: string,
    status: 'DRAFT' | 'COMPLETED' | 'CANCELLED',
    discountMoney?: number,
    taxMoney?: number,
    paidAmount?: number,
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
