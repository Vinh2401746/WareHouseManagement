import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthRequestLoginType } from "../../types/auth";

type AuthType = {
  loading: boolean;
  collapsed:boolean;
};

const initialAuthType: AuthType = {
  loading: false,
  collapsed:false
};
export const authSlice = createSlice({
  name: "auth",
  initialState: initialAuthType,
  reducers: {
    loginRequest: (state, action: PayloadAction<AuthRequestLoginType>) => {
      state.loading = true;
    },
    logginRequesteSuccess: (state) => {
      state.loading = false;
    },
    loginRequestedFailt: (state) => {
      state.loading = false;
    },
    logoutRequest : () =>{
    },
    collapMenuRequest:(state) =>{
      state.collapsed = !state.collapsed
    },
    getPermissionRequest:(state) =>{
    }
  },
});

export const { loginRequest, logginRequesteSuccess, loginRequestedFailt,logoutRequest,collapMenuRequest,getPermissionRequest } =
  authSlice.actions;
