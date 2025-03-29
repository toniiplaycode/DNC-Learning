import { configureStore } from "@reduxjs/toolkit";
import coursesReducer from "../features/courses/coursesSlice";
import instructorsReducer from "../features/user_instructors/instructorsSlice";
import categoriesReducer from "../features/categories/categoriesSlice";
import forumsReducer from "../features/forums/forumsSlice";
// Import các reducer khác nếu có

export const store = configureStore({
  reducer: {
    courses: coursesReducer,
    instructors: instructorsReducer,
    categories: categoriesReducer,
    forums: forumsReducer,
    // Thêm các reducer khác nếu có
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
