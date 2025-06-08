export enum FacultyStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export interface Major {
  id: number;
  majorCode: string;
  majorName: string;
  description?: string;
  status: FacultyStatus;
  facultyId: number;
  createdAt: string;
  updatedAt: string;
  programs?: Program[];
}

export interface Program {
  id: number;
  programCode: string;
  programName: string;
  description?: string;
  totalCredits: number;
  durationYears: number;
  status: FacultyStatus;
  majorId: number;
  createdAt: string;
  updatedAt: string;
  programCourses?: ProgramCourse[];
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
  createdAt: string;
  updatedAt: string;
  start_time?: string;
  end_time?: string;
  course?: Course;
}

export interface Course {
  id: number;
  title: string;
  description?: string;
  categoryId?: number;
  instructorId?: number;
  price: number;
  for: "student" | "student_academic" | "both";
  level: "beginner" | "intermediate" | "advanced";
  status: "draft" | "published" | "archived";
  thumbnailUrl?: string;
  required?: string;
  learned?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Faculty {
  id: number;
  facultyCode: string;
  facultyName: string;
  description?: string;
  status: FacultyStatus;
  createdAt: string;
  updatedAt: string;
  majors?: Major[];
}

export interface CreateFacultyDto {
  facultyCode: string;
  facultyName: string;
  description?: string;
  status?: FacultyStatus;
}

export interface UpdateFacultyDto extends Partial<CreateFacultyDto> {}
