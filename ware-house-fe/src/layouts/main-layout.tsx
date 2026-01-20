import { Outlet } from "react-router-dom";
import { Layout } from "antd";
import { AppHeader } from "./header";
import { MenusApp } from "./menus/menu";

const { Content } = Layout;

export const MainLayout = () => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <MenusApp />
      <Layout >
        <AppHeader />
        <Content style={{ padding: 16}}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
