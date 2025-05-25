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
import assignmentSubmissionsReducer from "../features/assignment-submissions/assignmentSubmissionsSlice";
import usersReducer from "../features/users/usersApiSlice";
import academicClassInstructorsReducer from "../features/academic-class-instructors/academicClassInstructorsSlice";
import courseSectionsReducer from "../features/course-sections/courseSectionSlice";
import courseLessonsReducer from "../features/course-lessons/courseLessonsSlice";
import messagesReducer from "../features/messages/messagesSlice";
import academicClassCoursesReducer from "../features/academic-class-courses/academicClassCoursesSlice";
import academicClassesReducer from "../features/academic-classes/academicClassesSlice";
import notificationsReducer from "../features/notifications/notificationsSlice";
import courseProgressReducer from "../features/course-progress/courseProgressSlice";
import paymentsReducer from "../features/payments/paymentsSlice";
import teachingSchedulesReducer from "../features/teaching-schedules/teachingSchedulesSlice";
import activeClassReducer from "../features/teaching-schedules/activeClassSlice";
import sessionAttendancesReducer from "../features/session-attendances/sessionAttendancesSlice";
import groupMessagesReducer from "../features/group-messages/groupMessagesSlice";

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
    assignmentSubmissions: assignmentSubmissionsReducer,
    users: usersReducer,
    academicClassInstructors: academicClassInstructorsReducer,
    courseSections: courseSectionsReducer,
    courseLessons: courseLessonsReducer,
    messages: messagesReducer,
    academicClassCourses: academicClassCoursesReducer,
    academicClasses: academicClassesReducer,
    notifications: notificationsReducer,
    courseProgress: courseProgressReducer,
    payments: paymentsReducer,
    teachingSchedules: teachingSchedulesReducer,
    activeClass: activeClassReducer,
    sessionAttendances: sessionAttendancesReducer,
    groupMessages: groupMessagesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
