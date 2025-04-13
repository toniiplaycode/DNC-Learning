export interface AcademicClassInstructor {
  id: number;
  classId: number;
  instructorId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClassInstructorDto {
  classId: number;
  instructorId: number;
}

export interface UpdateClassInstructorDto {
  classId?: number;
  instructorId?: number;
}
