import AxiosClient from "./axiosClient";

export type DashboardOverviewResponse = {
  kpis: {
    totalStock: number;
    totalStockValue: number;
    pendingImports: number;
    pendingExports: number;
    lowStockProductsCount: number;
  };
  charts: {
    dates: string[];
    importData: number[];
    exportData: number[];
  };
  recentTransactions: {
    id: string;
    type: string;
    status: string;
    transactionDate: string;
    totalAmount: number;
    createdBy: string;
    reason: string;
  }[];
  lowStockAlerts: {
    id: string;
    code: string;
    name: string;
    minStock: number;
    currentStock: number;
  }[];
  expiringBatches: {
    id: string;
    batchCode: string;
    quantity: number;
    expiryDate: string;
    product: {
      id: string;
      code: string;
      name: string;
    } | null;
  }[];
};

export const getDashboardOverviewApi = async (params?: { startDate?: string; endDate?: string; branchId?: string; warehouseId?: string }) => {
  const response = await AxiosClient.get<DashboardOverviewResponse>("/dashboard/overview", { params });
  return (response as unknown) as DashboardOverviewResponse;
};
