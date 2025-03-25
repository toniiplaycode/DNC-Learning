import { configureStore } from "@reduxjs/toolkit";
import coursesReducer from "../features/courses/coursesSlice";
// Import reducer khác nếu cần

export const store = configureStore({
  reducer: {
    courses: coursesReducer,
    // Thêm reducer khác nếu cần
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
