import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";
import { RouterRoot } from "./router";
import ConfigProvider from "antd/es/config-provider";
import { persistor, store } from "./store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ToastContainer } from "react-toastify";

const queryClient = new QueryClient();
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
