import { RootState } from "../../app/store";
import { createSelector } from "@reduxjs/toolkit";
import { ProgramCourse } from "../../types/program-course.types";

// Base selectors
export const selectProgramCoursesState = (state: RootState) =>
  state.programCourses;

export const selectAllProgramCourses = (state: RootState): ProgramCourse[] =>
  selectProgramCoursesState(state).programCourses;

export const selectCurrentProgramCourse = (
  state: RootState
): ProgramCourse | null =>
  selectProgramCoursesState(state).currentProgramCourse;

export const selectProgramCoursesStatus = (state: RootState) =>
  selectProgramCoursesState(state).status;

export const selectProgramCoursesError = (state: RootState) =>
  selectProgramCoursesState(state).error;

// Derived selectors
export const selectProgramCoursesByProgram = (programId: number) =>
  createSelector(selectAllProgramCourses, (programCourses: ProgramCourse[]) =>
    programCourses.filter((pc: ProgramCourse) => pc.programId === programId)
  );

export const selectProgramCoursesByCourse = (courseId: number) =>
  createSelector(selectAllProgramCourses, (programCourses: ProgramCourse[]) =>
    programCourses.filter((pc: ProgramCourse) => pc.courseId === courseId)
  );

export const selectProgramCourseById = (id: number) =>
  createSelector(selectAllProgramCourses, (programCourses: ProgramCourse[]) =>
    programCourses.find((pc: ProgramCourse) => pc.id === id)
  );

export const selectProgramCourseByProgramAndCourse = (
  programId: number,
  courseId: number
) =>
  createSelector(selectAllProgramCourses, (programCourses: ProgramCourse[]) =>
    programCourses.find(
      (pc: ProgramCourse) =>
        pc.programId === programId && pc.courseId === courseId
    )
  );

export const selectMandatoryProgramCourses = (programId: number) =>
  createSelector(
    selectProgramCoursesByProgram(programId),
    (programCourses: ProgramCourse[]) =>
      programCourses.filter((pc: ProgramCourse) => pc.isMandatory)
  );

export const selectOptionalProgramCourses = (programId: number) =>
  createSelector(
    selectProgramCoursesByProgram(programId),
    (programCourses: ProgramCourse[]) =>
      programCourses.filter((pc: ProgramCourse) => !pc.isMandatory)
  );

export const selectTotalCreditsByProgram = (programId: number) =>
  createSelector(
    selectProgramCoursesByProgram(programId),
    (programCourses: ProgramCourse[]) =>
      programCourses.reduce(
        (total: number, pc: ProgramCourse) => total + pc.credits,
        0
      )
  );

export const selectMandatoryCreditsByProgram = (programId: number) =>
  createSelector(
    selectMandatoryProgramCourses(programId),
    (programCourses: ProgramCourse[]) =>
      programCourses.reduce(
        (total: number, pc: ProgramCourse) => total + pc.credits,
        0
      )
  );

export const selectOptionalCreditsByProgram = (programId: number) =>
  createSelector(
    selectOptionalProgramCourses(programId),
    (programCourses: ProgramCourse[]) =>
      programCourses.reduce(
        (total: number, pc: ProgramCourse) => total + pc.credits,
        0
      )
  );
