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
  majorId: number;
  programId: number;
  createdAt: Date;
  updatedAt: Date;
  studentsAcademic?: any[];
  instructors?: any[];
  classCourses?: any[];
  major?: {
    id: number;
    majorCode: string;
    majorName: string;
  };
  program?: {
    id: number;
    programCode: string;
    programName: string;
  };
}

export interface CreateAcademicClassDto {
  classCode: string;
  className: string;
  semester: string;
  status: AcademicClassStatus;
  majorId: number;
  programId: number;
}

export interface UpdateAcademicClassDto
  extends Partial<CreateAcademicClassDto> {}
