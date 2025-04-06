import { configureStore } from "@reduxjs/toolkit";
import coursesReducer from "../features/courses/coursesSlice";
import instructorsReducer from "../features/user_instructors/instructorsSlice";
import categoriesReducer from "../features/categories/categoriesSlice";
import forumsReducer from "../features/forums/forumsSlice";
import authReducer from "../features/auth/authSlice";
import enrollmentsReducer from "../features/enrollments/enrollmentsApiSlice";
import certificatesReducer from "../features/certificates/certificatesApiSlice";
import discussionsReducer from "../features/discussions/discussionsSlice";
import documentsReducer from "../features/documents/documentsSlice";
import reviewsReducer from "../features/reviews/reviewsSlice";
import userGradesReducer from "../features/user-grades/userGradesSlice";
import quizzesReducer from "../features/quizzes/quizzesSlice";
import assignmentsReducer from "../features/assignments/assignmentsSlice";
import quizAttemptsReducer from "../features/quizAttempts/quizAttemptsSlice";
// Import các reducer khác nếu có

export const store = configureStore({
  reducer: {
    courses: coursesReducer,
    instructors: instructorsReducer,
    categories: categoriesReducer,
    forums: forumsReducer,
    auth: authReducer,
    enrollments: enrollmentsReducer,
    certificates: certificatesReducer,
    discussions: discussionsReducer,
    documents: documentsReducer,
    reviews: reviewsReducer,
    userGrades: userGradesReducer,
    quizzes: quizzesReducer,
    assignments: assignmentsReducer,
    quizAttempts: quizAttemptsReducer,
    // Thêm các reducer khác nếu có
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
