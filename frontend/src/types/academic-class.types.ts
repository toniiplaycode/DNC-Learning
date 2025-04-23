export enum AcademicClassStatus {
  ACTIVE = "active",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export interface AcademicClass {
  id: number;
  classCode: string;
  className: string;
  semester: string;
  status: AcademicClassStatus;
  createdAt: Date;
  updatedAt: Date;
  studentsAcademic?: any[];
  instructors?: any[];
  classCourses?: any[];
}

export interface CreateAcademicClassDto {
  classCode: string;
  className: string;
  semester: string;
  status: AcademicClassStatus;
}

export interface UpdateAcademicClassDto
  extends Partial<CreateAcademicClassDto> {}
