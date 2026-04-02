import { useCallback } from "react";
import {
  HomeOutlined,
  UserOutlined,
  AppstoreOutlined,
  ContactsOutlined,
  DatabaseOutlined,
  ShopOutlined,
  ImportOutlined,
  FileDoneOutlined,
  FunctionOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import { Flex, Layout, Menu, type MenuProps } from "antd";
import type { ItemType, MenuItemType } from "antd/es/menu/interface";
import "./menu.css";
import { useLocation, useNavigate } from "react-router-dom";
import { AppRoutes } from "../../router/routes";
import {  useAppSelector } from "../../store/hooks";

const { Sider } = Layout;

const ROUTE_PERMISSIONS: Record<string, string> = {
  [AppRoutes.user.list]: "user",
  [AppRoutes.role]: "user",
  [AppRoutes.products]: "products",
  [AppRoutes.supplier]: "suppliers",
  [AppRoutes.customer]: "suppliers", // Temporary reuse
  [AppRoutes.unit.list]: "units",
  [AppRoutes.warehouse.list]: "warehouses",
  [AppRoutes.branch.list]: "branches",
  [AppRoutes.warehouse_import_export]: "inventoryTransactions",
  [AppRoutes.sales_invoice]: "inventoryTransactions",
  [AppRoutes.inventory_batches]: "products", // temporary map to products read
};

const items: ItemType<MenuItemType>[] = [
  {
    key: AppRoutes.home.dashboard,
    icon: <HomeOutlined />,
    label: "Tổng quan",
  },
  {
    key: AppRoutes.user.list,
    icon: <UserOutlined />,
    label: "Người dùng",
  },
  {
    key: AppRoutes.role,
    icon: <SafetyOutlined />,
    label: "Vai trò & Phân quyền",
  },
  {
    key: AppRoutes.products,
    icon: <AppstoreOutlined />,
    label: "Sản phẩm",
  },
  // {
  //   key: AppRoutes.category,
  //   icon: <UploadOutlined />,
  //   label: "Danh mục sản phẩm",
  // },
  {
    key: AppRoutes.inventory_batches,
    icon: <DatabaseOutlined />,
    label: "Danh sách Lô hàng",
  },
   {
    key: AppRoutes.supplier,
    icon: <ContactsOutlined />,
    label: "Nhà cung cấp",
  },
   {
    key: AppRoutes.customer,
    icon: <UserOutlined />,
    label: "Khách hàng",
  },
  //    {
  //   key: AppRoutes.branch.list,
  //   icon: <UploadOutlined />,
  //   label: "Chi nhánh",
  // },
   {
    key: AppRoutes.unit.list,
    icon: <FunctionOutlined />,
    label: "Đơn vị",
  },
   {
    key: AppRoutes.warehouse.list,
    icon: <DatabaseOutlined />,
    label: "Kho",
  },
   {
    key: AppRoutes.branch.list,
    icon: <ShopOutlined />,
    label: "Cửa hàng",
  },
   {
    key: AppRoutes.warehouse_import_export,
    icon: <ImportOutlined />,
    label: "Nhập kho",
  },
   {
    key: AppRoutes.sales_invoice,
    icon: <FileDoneOutlined />,
    label: "Hoá đơn bán hàng",
  },
];

export const MenusApp = () => {
  const { collapsed } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();



  const onClick: MenuProps["onClick"] = useCallback(
    (e: any) => {
      navigate(e?.keyPath[0]);
    },
    [navigate],
  );

  const currentPermisson = useAppSelector((state: any) => state.auth.permission?.permissions);
  const user = useAppSelector((state: any) => state.auth.user);
  const permissionInfo = useAppSelector((state: any) => state.auth.permission);

  const filteredItems = items.filter(item => {
    const key = item?.key as string;
    if (key === AppRoutes.home.dashboard) return true; 
    
    const roleName = user?.role?.name?.toLowerCase();
    const roleKeyUser = user?.roleKey?.toLowerCase();
    const permRole = permissionInfo?.role?.toLowerCase();
    const permRoleKey = permissionInfo?.roleKey?.toLowerCase();

    const isSuperAdmin = [roleName, roleKeyUser, permRole, permRoleKey].some(r => 
        r === 'admin' || r === 'superadmin' || r === 'super admin'
    );
    
    if (isSuperAdmin) return true;
    
    const module = ROUTE_PERMISSIONS[key];
    if (!module) return true;
    
    const canView = currentPermisson?.[module as keyof typeof currentPermisson]?.join('')?.includes("get") || false;
    return canView;
  });

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={220}
      collapsedWidth={0}
      breakpoint="lg"
    >
      <Flex gap={10} align="center" justify="center" style={{ marginTop: 10 }}>
        {/* {!collapsed && (
          <span style={{ fontSize: 16, fontWeight: "bold" }}>KHO</span>
        )} */}
      </Flex>
      <Menu
        onClick={onClick}
        style={{ marginTop: 24 }}
        theme="dark"
        mode="inline"
        defaultSelectedKeys={[AppRoutes.home.dashboard]}
        items={filteredItems}
        selectedKeys={[location.pathname]}
        
      />
    </Sider>
  );
};


