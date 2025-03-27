import { configureStore } from "@reduxjs/toolkit";
import coursesReducer from "../features/courses/coursesSlice";
import instructorsReducer from "../features/instructors/instructorsSlice";
// Import các reducer khác nếu có

export const store = configureStore({
  reducer: {
    courses: coursesReducer,
    instructors: instructorsReducer,
    // Thêm các reducer khác nếu có
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
