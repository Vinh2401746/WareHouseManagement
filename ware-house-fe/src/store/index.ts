import { configureStore } from "@reduxjs/toolkit"
import { counterSlice } from "./toolkit"


export const store = configureStore({
  reducer: counterSlice.reducer
})
