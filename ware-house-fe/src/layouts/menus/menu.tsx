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
} from "@ant-design/icons";
import { Flex, Layout, Menu, type MenuProps } from "antd";
import type { ItemType, MenuItemType } from "antd/es/menu/interface";
import "./menu.css";
import { useLocation, useNavigate } from "react-router-dom";
import { AppRoutes } from "../../router/routes";
import {  useAppSelector } from "../../store/hooks";

const { Sider } = Layout;

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
    key: AppRoutes.supplier,
    icon: <ContactsOutlined />,
    label: "Nhà cung cấp",
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
        items={items}
        selectedKeys={[location.pathname]}
        
      />
    </Sider>
  );
};


