import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthRequestLoginType } from "../../types/auth";

type AuthType = {
  loading: boolean;
};

const initialAuthType: AuthType = {
  loading: false,
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
    }
  },
});

export const { loginRequest, logginRequesteSuccess, loginRequestedFailt,logoutRequest } =
  authSlice.actions;
