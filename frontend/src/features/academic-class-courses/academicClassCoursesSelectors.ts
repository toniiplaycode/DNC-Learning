import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";

// Base selectors
export const selectAcademicClassCoursesState = (state: RootState) =>
  state.academicClassCourses;

export const selectAllClassCourses = (state: RootState) =>
  state.academicClassCourses.classCourses;

export const selectClassCoursesStatus = (state: RootState) =>
  state.academicClassCourses.status;

export const selectClassCoursesError = (state: RootState) =>
  state.academicClassCourses.error;

// Derived selectors
export const selectCoursesByClassId = (classId: number) =>
  createSelector([selectAllClassCourses], (courses) =>
    courses.filter((course) => course.classId === classId)
  );

export const selectClassCourseById = (courseId: number) =>
  createSelector(
    [selectAllClassCourses],
    (courses) => courses.find((course) => course.id === courseId) || null
  );

export const selectClassCoursesCount = createSelector(
  [selectAllClassCourses],
  (courses) => courses.length
);
