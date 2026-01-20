import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import axios from "axios";
import { store } from "../store";
import { router } from "../router/routers";
import dispatchToast from "../constants/toast";
import { removeCurrentUser } from "../store/toolkit/user";
import { AppRoutes } from "../router/routes";



const AxiosClient = axios.create({
  baseURL: 'https://api.sanghh.space/v1/',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    transactionId: new Date().getTime().toString(),
  },
  timeout: 2000000,
});

AxiosClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig<any>) => {
    const {token} = store.getState().user.tokens.access;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
);

AxiosClient.interceptors.response.use(
  async (res: AxiosResponse<any, any>) => {

    // const transformed = {
    //   result: res.data?.result,
    //   data: res.data?.data,
    //   transactionId: res.data.transactionId,
    // } as Response;
    // // replace the data payload with your transformed object
    // res.data = transformed;
    return Promise.resolve(res.data);
  },
  async (err: AxiosResponse | any) => {
    if ([err?.response?.status,err.status].includes(401) ) {
      store.dispatch(removeCurrentUser());
      dispatchToast("error","Hết phiên làm việc. Vui lòng đăng nhập lại.")
      router.navigate(AppRoutes.root, { replace: true });
    }
    return Promise.reject(err);
  },
);

export default AxiosClient;
