import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import axios from "axios";
import { store } from "../../store";



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
    const token = store.getState().user.tokens.access;
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
    return Promise.resolve(res);
  },
  async (err: AxiosResponse) => {
    console.log("response erro",err);
    return Promise.reject(err);
  },
);

export default AxiosClient;
