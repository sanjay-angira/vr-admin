import { configureStore } from "@reduxjs/toolkit";
import adminAuthReducer from "@/services/redux/slices/adminSlices/adminAuthSlice";

export function makeStore() {
  return configureStore({
    reducer: {
      adminAuth: adminAuthReducer,
    },
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
