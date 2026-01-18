import { Outlet } from "react-router-dom";
import { Layout } from "antd";

const { Sider, Header, Content } = Layout;

export const MainLayout = () => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={300} style={{ background: "#211212" }}>
        Menu
      </Sider>

      <Layout>
        <Header style={{ background: "#fff" }}>
          Header
        </Header>

        <Content style={{ padding: 16 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
