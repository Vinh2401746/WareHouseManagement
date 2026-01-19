import { Layout, Input, Badge, Avatar, Space } from "antd";
import { SearchOutlined, BellOutlined, UserOutlined } from "@ant-design/icons";

const { Header } = Layout;

export const AppHeader = () => {
  return (
    <Header
      className="app-header"
      style={{
        backgroundColor:'white',
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      {/* LEFT */}
      <Input
        style={{
          maxWidth: "300px",
        //   height: 36,
          //   height: "36px",
          //   background: "#f5f5f5",
          //   border-radius: "8px",
        }}
        placeholder="Tìm kiếm..."
        prefix={<SearchOutlined />}
      />

      <Space size={20}>
        <Badge count={9} size="small">
          <BellOutlined className="app-header__icon" />
        </Badge>

        <Avatar
          size={36}
          icon={<UserOutlined />}
          src="https://i.pravatar.cc/150"
        />
      </Space>
    </Header>
  );
};
