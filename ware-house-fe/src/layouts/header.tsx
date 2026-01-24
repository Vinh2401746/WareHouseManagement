import {
  Layout,
  Input,
  Badge,
  Avatar,
  Dropdown,
  type DropdownProps,
  type MenuProps,
  Flex,
  Grid,
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
import { useCallback, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { collapMenuRequest, logoutRequest } from "../store/toolkit/auth";
const { Header } = Layout;
import "./header.css";
import ModalCommon, { type ModalCommonRef } from "../components/modal";
import { ChangePassword } from "../components/change-password";
const items: MenuProps["items"] = [
  {
    key: "Profile",
    label: "Profile",
  },
  {
    key: "Settings",
    label: "Đổi mật khẩu",
    icon: <SettingOutlined />,
  },
  {
    type: "divider",
  },
  {
    key: "Logout",
    label: "Đăng xuất",
    icon: <LogoutOutlined />,
    danger: true,
  },
];

const sharedProps: DropdownProps = {
  menu: { items },
  placement: "bottomRight",
};
const { useBreakpoint } = Grid;
export const AppHeader = () => {
  const { collapsed } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const screens = useBreakpoint();

  const prevMd = useRef(screens.md);
  const refModal = useRef<ModalCommonRef>(null)


  useEffect(() => {

    if (prevMd.current && !screens.md && !collapsed) {
      dispatch(collapMenuRequest());
    }

    if (!prevMd.current && screens.md && collapsed) {
      dispatch(collapMenuRequest());
    }

    prevMd.current = screens.md;
  }, [screens.md, collapsed, dispatch]);

  const handleMenuClick = useCallback(
    (item: any) => {
      switch (item.key) {
        case "Logout":
          dispatch(logoutRequest());
          break;
        case "Settings":
           refModal.current?.show()
          break;
        default:
          // dispatchToast("info", "Coming soome");
          break;
      }
    },
    [dispatch],
  );

  const handleCollape = () => dispatch(collapMenuRequest());

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
        position: "relative",
        // boxShadow : '10px 1px 4px rgba(149, 85, 85, 0.06)'
      }}
    >
      <Flex>
        <div
          onClick={handleCollape}
          style={{ position: "absolute", left: 0, top: 4 }}
        >
          {!collapsed ? (
            <FastBackwardOutlined className="icon-collaped" />
          ) : (
            <FastForwardOutlined className="icon-collaped" />
          )}
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
      <ModalCommon title="Đổi mật khẩu" ref={refModal} footer={null} >
        <ChangePassword  onClose={()=>refModal.current?.hide()}/>
      </ModalCommon>
    </Header>
  );
};
