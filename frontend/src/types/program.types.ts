import { Course } from "./course.types";

export enum ProgramStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export interface Program {
  id: number;
  programCode: string;
  programName: string;
  description?: string;
  totalCredits: number;
  durationYears: number;
  status: ProgramStatus;
  majorId: number;
  createdAt: string;
  updatedAt: string;
  programCourses?: ProgramCourse[];
  academicClasses?: AcademicClass[];
}

export interface ProgramCourse {
  id: number;
  programId: number;
  courseId: number;
  credits: number;
  semester: number;
  practice: number;
  theory: number;
  isMandatory: boolean;
  start_time?: string;
  end_time?: string;
  createdAt: string;
  updatedAt: string;
  course?: Course;
}

export interface AcademicClass {
  id: number;
  programId: number;
  // Add other academic class fields as needed
}

export interface CreateProgramDto {
  majorId: number;
  programCode: string;
  programName: string;
  description?: string;
  totalCredits: number;
  durationYears: number;
  status?: ProgramStatus;
}

export interface UpdateProgramDto {
  majorId?: number;
  programCode?: string;
  programName?: string;
  description?: string;
  totalCredits?: number;
  durationYears?: number;
  status?: ProgramStatus;
}

export interface AddCourseToProgramDto {
  credits: number;
  semester: number;
  practice: number;
  theory: number;
  isMandatory: boolean;
}

export interface UpdateProgramCourseDto {
  credits?: number;
  semester?: number;
  practice?: number;
  theory?: number;
  isMandatory?: boolean;
}
