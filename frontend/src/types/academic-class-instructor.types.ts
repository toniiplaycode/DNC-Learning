import { AcademicClass } from "./user.types";

export interface AcademicClassInstructor {
  id: number;
  classId: number;
  instructorId: number;
  createdAt: string;
  updatedAt: string;
  academicClass: AcademicClass;
}

export interface CreateClassInstructorDto {
  classId: number;
  instructorIds: number[];
}

export interface UpdateClassInstructorDto {
  classId?: number;
  instructorIds?: number[];
}
