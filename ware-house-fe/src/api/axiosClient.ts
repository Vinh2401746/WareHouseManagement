import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import axios from "axios";
import { store } from "../store";
import { router } from "../router/routers";
// import dispatchToast from "../constants/toast";
import { removeCurrentUser } from "../store/toolkit/user";
import { AppRoutes } from "../router/routes";
import dispatchToast from "../constants/toast";



const AxiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/v1/',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    transactionId: new Date().getTime().toString(),
  },
  timeout: 20000,
});

AxiosClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig<any>) => {
    const { token } = store.getState().user.tokens.access;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
);

AxiosClient.interceptors.response.use(
  async (res: AxiosResponse<any, any>) => {
    if (res.config.responseType === 'blob') {
      return Promise.resolve(res);
    }
    return Promise.resolve(res.data);
  },
  async (err: AxiosResponse | any) => {
    // console.log("rrror", err);

    const status = Number(err?.response?.status) || Number(err?.status);
    if (status === 401 && !err.config?.url?.includes('auth')) {
      store.dispatch(removeCurrentUser());
      dispatchToast("error", "Hết phiên làm việc. Vui lòng đăng nhập lại.")
      setTimeout(() => {
        router.navigate(AppRoutes.root, { replace: true });
      }, 0);
    }
    return Promise.reject(err);
  },
);

export default AxiosClient;
