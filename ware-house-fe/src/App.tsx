import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";
import { RouterRoot } from "./router";
import ConfigProvider from "antd/es/config-provider";
import { persistor, store } from "./store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ToastContainer } from "react-toastify";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: 0,
      retry: false,
    },
    mutations: {
      gcTime: 0,
    },
  },
});
function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
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
              components: {
                Table: {
                  headerBg:'#dfdede',
                  borderRadius: 8,
                
                  rowHoverBg : '#c2c2c5'
                },
              },
            }}
          >
            <RouterRoot />
            <ToastContainer />
          </ConfigProvider>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;
