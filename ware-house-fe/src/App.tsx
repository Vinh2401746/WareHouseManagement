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
      placeholderData: (previousData:any) => previousData,
      refetchOnWindowFocus:false,
      
      
    },
    mutations: {
      // gcTime: 0,
      retry:false
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
                colorPrimary: "#2f6fed",
                colorInfo: "#2f6fed",
                colorSuccess: "#16a34a",
                colorWarning: "#d97706",
                colorError: "#dc2626",

                fontFamily:
                  '"IBM Plex Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Arial, sans-serif',
                fontFamilyCode:
                  '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',

                borderRadius: 10,
                borderRadiusLG: 14,
                lineHeight: 1.45,

                colorText: "rgba(15, 23, 42, 0.92)",
                colorTextSecondary: "rgba(15, 23, 42, 0.68)",

                colorBgLayout: "#f5f7fb",
                colorBgContainer: "#ffffff",
                colorBorder: "rgba(15, 23, 42, 0.12)",
              },
              components: {
                Layout: {
                  headerBg: "#001529",
                  siderBg: "#001529",
                  bodyBg: "transparent",
                },
                Menu: {
                  darkItemBg: "#001529",
                  darkSubMenuItemBg: "#001529",
                  darkPopupBg: "#001529",
                  darkItemSelectedBg: "rgba(47, 111, 237, 0.28)",
                  darkItemHoverBg: "rgba(255, 255, 255, 0.08)",
                },
                Table: {
                  headerBg: "rgba(15, 23, 42, 0.04)",
                  headerColor: "rgba(15, 23, 42, 0.84)",
                  headerSplitColor: "rgba(15, 23, 42, 0.08)",
                  rowHoverBg: "rgba(47, 111, 237, 0.06)",
                  borderColor: "rgba(15, 23, 42, 0.10)",
                },
                Card: {
                  headerBg: "transparent",
                },
                Input: {
                  controlHeight: 38,
                },
                Select: {
                  controlHeight: 38,
                },
                DatePicker: {
                  controlHeight: 38,
                },
                Button: {
                  controlHeight: 38,
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
