import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";
import { RouterRoot } from "./router";
import ConfigProvider from "antd/es/config-provider";
const queryClient = new QueryClient();
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          token: {
            // // Seed Token
            // colorPrimary: "#00b96b",
            // borderRadius: 2,
            // // Alias Token
            // colorBgContainer: "#f6ffed",
          },
        }}
      >
        <RouterRoot />
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
