import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";

export const selectAcademicClassesState = (state: RootState) =>
  state.academicClasses;
export const selectAllAcademicClasses = (state: RootState) =>
  state.academicClasses.academicClasses;
export const selectCurrentClass = (state: RootState) =>
  state.academicClasses.currentClass;
export const selectAcademicClassesStatus = (state: RootState) =>
  state.academicClasses.status;
export const selectAcademicClassesError = (state: RootState) =>
  state.academicClasses.error;
export const selectProgramCourses = (state: RootState) =>
  state.academicClasses.programCourses;

export const selectAcademicClassById = (classId: number) =>
  createSelector(
    [selectAllAcademicClasses],
    (classes) => classes.find((c) => c.id === classId) || null
  );

export const selectAcademicClassesBySemester = (semester: string) =>
  createSelector([selectAllAcademicClasses], (classes) =>
    classes.filter((c) => c.semester === semester)
  );

export const selectActiveAcademicClasses = createSelector(
  [selectAllAcademicClasses],
  (classes) => classes.filter((c) => c.status === "active")
);
