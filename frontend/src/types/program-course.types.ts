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
  start_time?: string | null;
  end_time?: string | null;
}

export interface CreateProgramCourseDto {
  programId: number;
  courseId: number;
  credits: number;
  semester?: number;
  practice?: number;
  theory?: number;
  isMandatory?: boolean;
  start_time?: string;
  end_time?: string;
}

export interface UpdateProgramCourseDto {
  credits?: number;
  semester?: number;
  practice?: number;
  theory?: number;
  start_time?: string;
  end_time?: string;
  isMandatory?: boolean;
}
