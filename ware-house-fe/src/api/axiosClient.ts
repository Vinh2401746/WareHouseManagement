import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import axios from "axios";
import { store } from "../store";
import { router } from "../router/routers";
import { removeCurrentUser, setTokens } from "../store/toolkit/user";
import { AppRoutes } from "../router/routes";
import dispatchToast from "../constants/toast";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/v1/";

const AxiosClient = axios.create({
  baseURL,
  headers: {
    Accept: "application/json",
    transactionId: new Date().getTime().toString(),
  },
  timeout: 20000,
});

const refreshClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 20000,
});

let refreshPromise: Promise<any> | null = null;

AxiosClient.interceptors.request.use(async (config: InternalAxiosRequestConfig<any>) => {
  const { token } = store.getState().user.tokens.access;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Let the browser set the correct boundary for FormData uploads.
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  } else if (!config.headers["Content-Type"]) {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

AxiosClient.interceptors.response.use(
  async (res: AxiosResponse<any, any>) => {
    if (res.config.responseType === "blob") {
      return Promise.resolve(res);
    }
    return Promise.resolve(res.data);
  },
  async (err: AxiosResponse | any) => {
    const status = Number(err?.response?.status) || Number(err?.status);
    const requestUrl = String(err?.config?.url || "");

    const shouldHandleAuth = status === 401 && !requestUrl.includes("auth");
    if (!shouldHandleAuth) return Promise.reject(err);

    const hasRetried = Boolean(err?.config?._retry);
    const { refresh } = store.getState().user.tokens;
    const refreshToken = refresh?.token;

    if (refreshToken && !hasRetried) {
      err.config._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = refreshClient
            .post("auth/refresh-tokens", { refreshToken })
            .then((r) => r.data)
            .finally(() => {
              refreshPromise = null;
            });
        }

        const newTokens = await refreshPromise;
        const newAccessToken = newTokens?.access?.token;

        if (newAccessToken) {
          store.dispatch(setTokens(newTokens));
          err.config.headers = err.config.headers || {};
          err.config.headers.Authorization = `Bearer ${newAccessToken}`;
          return AxiosClient.request(err.config);
        }
      } catch (e) {
        // fall through to logout
      }
    }

    store.dispatch(removeCurrentUser());
    dispatchToast("error", "Hết phiên làm việc. Vui lòng đăng nhập lại.");
    setTimeout(() => {
      router.navigate(AppRoutes.root, { replace: true });
    }, 0);

    return Promise.reject(err);
  },
);

export default AxiosClient;
