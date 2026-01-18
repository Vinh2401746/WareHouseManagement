import { combineReducers } from '@reduxjs/toolkit';
import {authSlice,userSlice} from './toolkit';

export const rootReducer = combineReducers({
  auth: authSlice.reducer,
  user: userSlice.reducer,
});

