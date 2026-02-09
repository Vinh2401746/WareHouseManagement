export type GetBranchsRequestType = {
  name?: string;
  address?: string;
  phone?: string;
  sortBy?: string;
  limit: number;
  page: number;
};

export type PostBranchType = {
  name: string;
  address: string;
  phone: string;
};

export type UpdateBranchType = {
  branchId: string;
  name: string;
  address: string;
  phone: string;
};

export type DeleteBranchReuestType = {
    branchId: string;
}
