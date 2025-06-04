import { RootState } from "../../app/store";
import { Major } from "../../types/major.types";

export const selectAllMajors = (state: RootState) => state.majors.majors;

export const selectCurrentMajor = (state: RootState) =>
  state.majors.currentMajor;

export const selectMajorsStatus = (state: RootState) => state.majors.status;

export const selectMajorsError = (state: RootState) => state.majors.error;

export const selectMajorsByFaculty = (state: RootState, facultyId: number) =>
  state.majors.majors.filter((major: Major) => major.facultyId === facultyId);

export const selectMajorById = (state: RootState, majorId: number) =>
  state.majors.majors.find((major: Major) => major.id === majorId);

export const selectMajorByCode = (state: RootState, code: string) =>
  state.majors.majors.find((major: Major) => major.code === code);
