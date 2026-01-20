import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthResponseLoginType } from "../../types/auth";
const initUserType: AuthResponseLoginType = {
  user: {
    role: "",
    isEmailVerified: false,
    email: "",
    name: "",
    id: "",
  },
  tokens: {
    access: {
      token: null,
      expires: null,
    },
    refresh: {
      token: null,
      expires: null,
    },
  },
};
export const userSlice = createSlice({
  name: "user",
  initialState: initUserType,
  reducers: {
    setInforUser: (state, active: PayloadAction<AuthResponseLoginType>) => {
      state = active.payload
      return state;
    },
    removeCurrentUser :(state)=>{
      return {
        ...state,
        ...initUserType
      }
    }
  },
});

export const { setInforUser,removeCurrentUser } = userSlice.actions;
