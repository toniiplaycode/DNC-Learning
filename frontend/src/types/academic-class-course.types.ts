export interface AcademicClassCourse {
  id: number;
  classId: number;
  courseId: number;
  academicClass: {
    id: number;
    className: string;
    classCode: string;
  };
  course: {
    id: number;
    title: string;
    description: string;
    thumbnailUrl: string;
    category: {
      id: number;
      name: string;
    };
    instructor: {
      id: number;
      fullName: string;
      professionalTitle: string;
      avatarUrl: string;
    };
  };
}

export interface CreateAcademicClassCourseDto {
  classId: number;
  courseId: number;
}

export interface UpdateAcademicClassCourseDto {
  classId?: number;
  courseId?: number;
}
