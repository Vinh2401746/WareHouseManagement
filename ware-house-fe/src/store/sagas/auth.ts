import { call, delay, put, takeLatest } from "redux-saga/effects";
import { authLoginApi } from "../../api/auth/auth";
import { setInforUser,removeCurrentUser } from "../toolkit/user";
import {
  logginRequesteSuccess,
  loginRequestedFailt,
  loginRequest,
  logoutRequest,
  getPermissionRequest,
  getPermissionSuccess,
  getPermissionFailt
} from "../toolkit/auth";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AuthRequestLoginType, AuthResponseLoginType, permissionType } from "../../types/auth";
import dispatchToast from "../../constants/toast";
import { getPermission } from "../../api/users/users";
// Worker saga will be fired on USER_FETCH_REQUESTED actions
const fakeAuthResponse: AuthResponseLoginType = {
  user: {
    role: "ADMIN",
    isEmailVerified: true,
    email: "john.doe@example.com",
    name: "John Doe",
    id: "a3f9c2b1-7e4d-4c9a-9f2a-123456789abc",
  },
  tokens: {
    access: {
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fakeAccessToken123456",
      expires: new Date("2026-12-31T23:59:59.000Z"),
    },
    refresh: {
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fakeRefreshToken987654",
      expires: new Date("2027-01-31T23:59:59.000Z"),
    },
  },
};
function* loginSaga(action: PayloadAction<AuthRequestLoginType>) {
  try {
    const inforLogin: AuthResponseLoginType = yield call(authLoginApi, action.payload);
    console.log("inforLogin",inforLogin);
    
    yield put(logginRequesteSuccess());
    yield put(setInforUser(inforLogin));

    yield delay(500)
    yield put(getPermissionRequest())

    //   yield put({type: "USER_FETCH_SUCCEEDED", user: user});
  } catch (e: any) {
    console.log("login sage",e);
    yield put(loginRequestedFailt());
    if(e?.code.includes("ECONNABORTED")) return dispatchToast("error", "Máy chủ không phản hồi")
    dispatchToast("error", e?.response?.data?.message || e?.message || "Lỗi hệ thống vui lòng thử lại sau!");
    //   yield put({type: "USER_FETCH_FAILED", message: e.message});
  }
}

function* logoutSaga() {
  try {
   
    yield put(removeCurrentUser());
    //   yield put({type: "USER_FETCH_SUCCEEDED", user: user});
  } catch (e) {
    yield put(removeCurrentUser());
    //   yield put({type: "USER_FETCH_FAILED", message: e.message});
  }
}

function* getPermissionSaga() {
  try {
   const permissonResponse :permissionType = yield call(getPermission)
   console.log("permissonResponse",permissonResponse)
   if(permissonResponse.userId){
      yield put(getPermissionSuccess(permissonResponse));
      return;
   }
  } catch (e) {
      yield put(getPermissionFailt());
  }
}

// Starts loginSaga on each dispatched USER_FETCH_REQUESTED action
// Allows concurrent fetches of user
export function* authSaga() {
  yield takeLatest(loginRequest.type, loginSaga);
  yield takeLatest(logoutRequest.type, logoutSaga);
  yield takeLatest(getPermissionRequest.type, getPermissionSaga);
}
