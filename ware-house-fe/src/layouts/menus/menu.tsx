import { useCallback } from "react";
import {
  HomeOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { Flex, Layout, Menu, type MenuProps } from "antd";
import type { ItemType, MenuItemType } from "antd/es/menu/interface";
import "./menu.css";
import { useLocation, useNavigate } from "react-router-dom";
import { AppRoutes } from "../../router/routes";
import {  useAppSelector } from "../../store/hooks";
import IcLogo from '../../assets/svg/logo.svg'

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
    key: AppRoutes.goods,
    icon: <VideoCameraOutlined />,
    label: "Danh mục hàng",
  },
  {
    key: AppRoutes.unit,
    icon: <UploadOutlined />,
    label: "Đơn vị tính",
  },
   {
    key: AppRoutes.supplier,
    icon: <UploadOutlined />,
    label: "Nhà cung cấp",
  },
   {
    key: AppRoutes.warehouse,
    icon: <UploadOutlined />,
    label: "Kho",
  },
   {
    key: AppRoutes.store,
    icon: <UploadOutlined />,
    label: "Cửa hàng",
  },
   {
    key: AppRoutes.invoice_import_export,
    icon: <UploadOutlined />,
    label: "Hoá đơn nhập/xuất",
  },
   {
    key: AppRoutes.sales_invoice,
    icon: <UploadOutlined />,
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
      width={300}
      collapsedWidth={80}
    >
      <Flex gap={10} align="center" justify="center" style={{ marginTop: 10 }}>
        <img src={IcLogo} alt="powersync" width={100} height={ collapsed ? 40 : 80} />
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
