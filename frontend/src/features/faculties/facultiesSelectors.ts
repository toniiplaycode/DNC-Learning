import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";

// Basic selectors
export const selectFacultiesState = (state: RootState) => state.faculties;
export const selectAllFaculties = (state: RootState) =>
  state.faculties.faculties;
export const selectCurrentFaculty = (state: RootState) =>
  state.faculties.currentFaculty;
export const selectFacultiesStatus = (state: RootState) =>
  state.faculties.status;
export const selectFacultiesError = (state: RootState) => state.faculties.error;

// Derived selectors
export const selectFacultyById = (facultyId: number) =>
  createSelector(
    [selectAllFaculties],
    (faculties) => faculties.find((f) => f.id === facultyId) || null
  );

export const selectFacultyByCode = (facultyCode: string) =>
  createSelector(
    [selectAllFaculties],
    (faculties) => faculties.find((f) => f.facultyCode === facultyCode) || null
  );

export const selectActiveFaculties = createSelector(
  [selectAllFaculties],
  (faculties) => faculties.filter((f) => f.status === "active")
);

export const selectFacultiesWithMajors = createSelector(
  [selectAllFaculties],
  (faculties) => faculties.filter((f) => f.majors && f.majors.length > 0)
);

export const selectFacultiesWithPrograms = createSelector(
  [selectAllFaculties],
  (faculties) =>
    faculties.filter((f) =>
      f.majors?.some((major) => major.programs && major.programs.length > 0)
    )
);
