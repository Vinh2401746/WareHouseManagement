import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthRequestLoginType, permissionType } from "../../types/auth";

type AuthType = {
  loading: boolean;
  collapsed:boolean;
  permission:permissionType | null
};

const initialAuthType: AuthType = {
  loading: false,
  collapsed:false,
  permission: null
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
    logoutRequest : (state) =>{
      state =initialAuthType
    },
    collapMenuRequest:(state) =>{
      state.collapsed = !state.collapsed
    },
    getPermissionRequest:(state) =>{
    },
    getPermissionSuccess:(state,action:PayloadAction<permissionType>) =>{
      return {
        ...state,
        permission : action.payload
      }
    },
    getPermissionFailt:(state) =>{
      state.permission  = null
    },
  },
});

export const { loginRequest, logginRequesteSuccess, loginRequestedFailt,logoutRequest,collapMenuRequest,getPermissionRequest,getPermissionSuccess,getPermissionFailt } =
  authSlice.actions;
