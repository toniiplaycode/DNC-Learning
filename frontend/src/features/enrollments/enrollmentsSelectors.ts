import { RootState } from "../../app/store";
import { createSelector } from "@reduxjs/toolkit";
import { EnrollmentStatus } from "../../types/enrollment.types";

// Base selectors
export const selectEnrollmentsState = (state: RootState) => state.enrollments;
export const selectAllEnrollments = (state: RootState) =>
  state.enrollments.enrollments;
export const selectUserEnrollments = (state: RootState) =>
  state.enrollments.userEnrollments;
export const selectCourseEnrollments = (state: RootState) =>
  state.enrollments.courseEnrollments;
export const selectEnrollmentStats = (state: RootState) =>
  state.enrollments.stats;
export const selectEnrollmentsStatus = (state: RootState) =>
  state.enrollments.status;
export const selectEnrollmentsError = (state: RootState) =>
  state.enrollments.error;

// Derived selectors
export const selectActiveUserEnrollments = createSelector(
  [selectUserEnrollments],
  (enrollments) =>
    enrollments.filter((e) => e.status === EnrollmentStatus.ACTIVE)
);

export const selectCompletedUserEnrollments = createSelector(
  [selectUserEnrollments],
  (enrollments) =>
    enrollments.filter((e) => e.status === EnrollmentStatus.COMPLETED)
);

export const selectDroppedUserEnrollments = createSelector(
  [selectUserEnrollments],
  (enrollments) =>
    enrollments.filter((e) => e.status === EnrollmentStatus.DROPPED)
);

// Check if user is enrolled in a specific course
export const selectIsUserEnrolledInCourse = (courseId: number) =>
  createSelector([selectUserEnrollments], (enrollments) =>
    enrollments.some(
      (e) => e.courseId === courseId && e.status !== EnrollmentStatus.DROPPED
    )
  );

// Get a specific enrollment if it exists
export const selectEnrollmentByCourseId = (courseId: number) =>
  createSelector([selectUserEnrollments], (enrollments) =>
    enrollments.find((e) => e.courseId === courseId)
  );

// Select enrollment count by status
export const selectEnrollmentCountByStatus = createSelector(
  [selectUserEnrollments],
  (enrollments) => {
    return {
      active: enrollments.filter((e) => e.status === EnrollmentStatus.ACTIVE)
        .length,
      completed: enrollments.filter(
        (e) => e.status === EnrollmentStatus.COMPLETED
      ).length,
      dropped: enrollments.filter((e) => e.status === EnrollmentStatus.DROPPED)
        .length,
      total: enrollments.length,
    };
  }
);

// Select average progress of active enrollments
export const selectAverageProgress = createSelector(
  [selectActiveUserEnrollments],
  (enrollments) => {
    if (enrollments.length === 0) return 0;
    const totalProgress = enrollments.reduce((sum, e) => sum + e.progress, 0);
    return Math.round(totalProgress / enrollments.length);
  }
);

// Select recently enrolled courses
export const selectRecentEnrollments = createSelector(
  [selectUserEnrollments],
  (enrollments) => {
    return [...enrollments]
      .sort(
        (a, b) =>
          new Date(b.enrollmentDate).getTime() -
          new Date(a.enrollmentDate).getTime()
      )
      .slice(0, 5); // Get the 5 most recent enrollments
  }
);
