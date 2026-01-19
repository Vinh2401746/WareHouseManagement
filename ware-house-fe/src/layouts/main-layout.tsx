import { Outlet } from "react-router-dom";
import { Layout } from "antd";
import { AppHeader } from "./header";

const { Sider, Content } = Layout;

export const MainLayout = () => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={300} style={{backgroundColor :'white'}}>
        Menufsfs
      </Sider>

      <Layout style={{width: '100%'}}>
        <AppHeader />
        <Content style={{ padding: 16 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
