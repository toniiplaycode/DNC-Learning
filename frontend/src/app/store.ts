import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import coursesReducer from "../features/courses/coursesSlice";
import categoriesReducer from "../features/categories/categoriesSlice";
import enrollmentsReducer from "../features/enrollments/enrollmentsApiSlice";
import certificatesReducer from "../features/certificates/certificatesApiSlice";
import discussionsReducer from "../features/discussions/discussionsSlice";
import documentsReducer from "../features/documents/documentsSlice";
import reviewsReducer from "../features/reviews/reviewsSlice";
import userGradesReducer from "../features/user-grades/userGradesSlice";
import quizzesReducer from "../features/quizzes/quizzesSlice";
import assignmentsReducer from "../features/assignments/assignmentsSlice";
import quizAttemptsReducer from "../features/quizAttempts/quizAttemptsSlice";
// Import other reducers...

export const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: coursesReducer,
    categories: categoriesReducer,
    enrollments: enrollmentsReducer,
    certificates: certificatesReducer,
    discussions: discussionsReducer,
    documents: documentsReducer,
    reviews: reviewsReducer,
    userGrades: userGradesReducer,
    quizzes: quizzesReducer,
    assignments: assignmentsReducer,
    quizAttempts: quizAttemptsReducer,
    // Add other reducers...
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
