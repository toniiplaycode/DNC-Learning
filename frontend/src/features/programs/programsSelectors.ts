import { RootState } from "../../app/store";
import { Program } from "../../types/program.types";

export const selectAllPrograms = (state: RootState) => state.programs.programs;

export const selectCurrentProgram = (state: RootState) =>
  state.programs.currentProgram;

export const selectProgramsStatus = (state: RootState) => state.programs.status;

export const selectProgramsError = (state: RootState) => state.programs.error;

export const selectStudentAcademicProgram = (state: RootState) =>
  state.programs.studentAcademicProgram;

export const selectProgramsByMajor = (state: RootState, majorId: number) =>
  state.programs.programs.filter(
    (program: Program) => program.majorId === majorId
  );

export const selectProgramById = (state: RootState, programId: number) =>
  state.programs.programs.find((program: Program) => program.id === programId);

export const selectProgramByCode = (state: RootState, code: string) =>
  state.programs.programs.find(
    (program: Program) => program.programCode === code
  );

export const selectProgramCourses = (state: RootState, programId: number) => {
  const program = state.programs.programs.find(
    (program: Program) => program.id === programId
  );
  return program?.programCourses || [];
};

export const selectMandatoryCourses = (state: RootState, programId: number) => {
  const program = state.programs.programs.find(
    (program: Program) => program.id === programId
  );
  return program?.programCourses?.filter((pc) => pc.isMandatory) || [];
};

export const selectOptionalCourses = (state: RootState, programId: number) => {
  const program = state.programs.programs.find(
    (program: Program) => program.id === programId
  );
  return program?.programCourses?.filter((pc) => !pc.isMandatory) || [];
};
