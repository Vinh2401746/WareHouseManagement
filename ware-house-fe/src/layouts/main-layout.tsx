import { Outlet } from "react-router-dom";
import { Layout } from "antd";
import { AppHeader } from "./header";
import { MenusApp } from "./menus/menu";

const { Content } = Layout;

export const MainLayout = () => {
  return (
    <Layout style={{ minHeight: "100vh", overflow: "hidden" }}>
      <AppHeader />
      <Layout>
        <MenusApp />
        <Content
          style={{
            padding: 16,
            height: "calc(100vh - 60px)",
            overflowY: "auto",
            background: "var(--app-surface-2)",
            border: "1px solid var(--app-border)",
            borderRadius: 16,
            backdropFilter: "blur(10px)",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
