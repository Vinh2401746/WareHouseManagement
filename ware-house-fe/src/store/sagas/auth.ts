import { call, put, takeLatest } from "redux-saga/effects";
import { authLoginApi } from "../../api/auth/auth";
import { setInforUser,removeCurrentUser } from "../toolkit/user";
import {
  logginRequesteSuccess,
  loginRequestedFailt,
  loginRequest,
  logoutRequest
} from "../toolkit/auth";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AuthRequestLoginType, AuthResponseLoginType } from "../../types/auth";
import dispatchToast from "../../constants/toast";
// Worker saga will be fired on USER_FETCH_REQUESTED actions
function* loginSaga(action: PayloadAction<AuthRequestLoginType>) {
  try {
    const inforLogin: AuthResponseLoginType = yield call(authLoginApi, action.payload);
    
    yield put(logginRequesteSuccess());
      yield put(setInforUser(inforLogin));

    //   yield put({type: "USER_FETCH_SUCCEEDED", user: user});
  } catch (e: any) {
    dispatchToast("error", e.message || "Lỗi hệ thống vui lòng thử lại sau!");
    yield put(loginRequestedFailt());
    //   yield put({type: "USER_FETCH_FAILED", message: e.message});
  }
}

function* logoutSaga() {
  try {
   
    yield put(removeCurrentUser());
    //   yield put({type: "USER_FETCH_SUCCEEDED", user: user});
  } catch (e: any) {
    yield put(removeCurrentUser());
    //   yield put({type: "USER_FETCH_FAILED", message: e.message});
  }
}

// Starts loginSaga on each dispatched USER_FETCH_REQUESTED action
// Allows concurrent fetches of user
export function* authSaga() {
  yield takeLatest(loginRequest.type, loginSaga);
  yield takeLatest(logoutRequest.type, logoutSaga);
}
