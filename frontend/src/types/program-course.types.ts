import { Program } from "./program.types";
import { Course } from "./course.types";

export interface ProgramCourse {
  id: number;
  programId: number;
  courseId: number;
  credits: number;
  semester: number;
  practice: number;
  theory: number;
  isMandatory: boolean;
  program?: Program;
  course?: Course;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProgramCourseDto {
  programId: number;
  courseId: number;
  credits: number;
  semester?: number;
  practice?: number;
  theory?: number;
  isMandatory?: boolean;
}

export interface UpdateProgramCourseDto {
  credits?: number;
  semester?: number;
  practice?: number;
  theory?: number;
  isMandatory?: boolean;
}
