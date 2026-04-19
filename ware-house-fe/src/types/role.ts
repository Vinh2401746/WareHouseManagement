

export type RoleType = {
  id: string;
  name: string;
  key: string;
  description?: string;
  scope: 'branch' | 'global';
  permissionIds?: string[];
  permissions?: Array<{ id?: string; _id?: string; code?: string; name?: string }>;
  isSystem?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type GetRolesRequestType = {
  page?: number;
  limit?: number;
  key?: string;
  name?: string;
  scope?: string;
  isSystem?: boolean;
};

export type PostRoleType = {
  name: string;
  key: string;
  description?: string;
  scope: 'branch' | 'global';
  permissionIds: string[];
};

export type UpdateRoleType = {
  id: string;
} & Partial<PostRoleType>;

export type DeleteRoleRequestType = {
  id: string;
};
