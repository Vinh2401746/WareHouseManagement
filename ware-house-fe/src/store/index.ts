import { configureStore } from "@reduxjs/toolkit";

import createSagaMiddleware from "redux-saga";
import { rootSaga } from "./sagas";
import { rootReducer } from "./root-reducer";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user"], // store is need save
  blacklist: [],
};
const persistedReducer = persistReducer(persistConfig, rootReducer);
const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: false, serializableCheck: false }).concat(
      sagaMiddleware,
    ),
});
export const persistor = persistStore(store);
sagaMiddleware.run(rootSaga);
