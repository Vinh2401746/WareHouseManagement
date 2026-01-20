import React, { useCallback, useState } from "react";
import {
  HomeOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { Flex, Layout, Menu, type MenuProps } from "antd";
import type { ItemType, MenuItemType } from "antd/es/menu/interface";
import "./menu.css";
import { useNavigate } from "react-router-dom";
import { AppRoutes } from "../../router/routes";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

const { Sider } = Layout;

const items: ItemType<MenuItemType>[] = [
  {
    key: AppRoutes.home.dashboard,
    icon: <UserOutlined />,
    label: "Tổng quan",
  },
  {
    key: AppRoutes.user.list,
    icon: <UserOutlined />,
    label: "Người dùng",
  },
  {
    key: "3",
    icon: <VideoCameraOutlined />,
    label: "nav 2",
    children: [
      {
        key: "1-1",
        icon: <UserOutlined />,
        label: "nav 1-1",
      },
    ],
  },
  {
    key: "4",
    icon: <UploadOutlined />,
    label: "nav 3",
  },
];

export const MenusApp = () => {
  const { collapsed } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const onClick: MenuProps["onClick"] = useCallback(
    (e: any) => {
      navigate(e?.keyPath[0]);
      //   console.log("click ", navigate(e?.keyPath[0]));
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
        <HomeOutlined
          style={{
            fontSize: 50,
          }}
        />
        {!collapsed && (
          <span style={{ fontSize: 16, fontWeight: "bold" }}>MANAGEMENT</span>
        )}
      </Flex>
      <Menu
        onClick={onClick}
        style={{ marginTop: 24 }}
        theme="dark"
        mode="inline"
        defaultSelectedKeys={["1"]}
        items={items}
      />
    </Sider>
  );
};
