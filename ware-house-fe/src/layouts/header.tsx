import {
  Layout,
  Input,
  Badge,
  Avatar,
  Dropdown,
  type DropdownProps,
  type MenuProps,
  Flex,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellFilled,
  FastBackwardOutlined,
  FastForwardOutlined,
} from "@ant-design/icons";
import AvatarDefault from "../assets/images/avatar_df.jpg";
import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { collapMenuRequest, logoutRequest } from "../store/toolkit/auth";
import dispatchToast from "../constants/toast";
const { Header } = Layout;
import './header.css'
const items: MenuProps["items"] = [
  {
    key: "Profile",
    label: "Profile",
  },
  {
    key: "Settings",
    label: "Settings",
    icon: <SettingOutlined />,
  },
  {
    type: "divider",
  },
  {
    key: "Logout",
    label: "Logout",
    icon: <LogoutOutlined />,
    danger: true,
  },
];

const sharedProps: DropdownProps = {
  menu: { items },
  placement: "bottomRight",
};
export const AppHeader = () => {
  const { collapsed } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const handleMenuClick = useCallback(
    (item: any) => {
      switch (item.key) {
        case "Logout":
          dispatch(logoutRequest());
          break;
        default:
          dispatchToast("info", "Coming soome");
          break;
      }
    },
    [dispatch],
  );

  const handleCollape = () => dispatch(collapMenuRequest())
  return (
    <Header
      // className="app-header"
      style={{
        backgroundColor: "white",
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "row",
        alignItems: "center",
        background: "#001529",
        position:'relative'
        // boxShadow : '10px 1px 4px rgba(149, 85, 85, 0.06)'
      }}
    >
      <Flex  >
        <div onClick={handleCollape} style={{position:'absolute', left: 0, top:4}}>
        {!collapsed ? <FastBackwardOutlined className="icon-collaped" /> : <FastForwardOutlined className="icon-collaped"  />}
        </div>
      <Input
        style={{
          maxWidth: "300px",
        }}
        placeholder="Tìm kiếm..."
        prefix={<SearchOutlined />}
      />
      </Flex>


      <Flex gap={24} align="center">
        <Badge count={9} size="default">
          <BellFilled style={{ color: "white", fontSize: 20 }} />
        </Badge>
        <Dropdown
          {...sharedProps}
          trigger={["click"]}
          menu={{
            items,
            onClick: handleMenuClick,
          }}
        >
          <Avatar size={36} icon={<UserOutlined />} src={AvatarDefault} />
        </Dropdown>
      </Flex>
    </Header>
  );
};
