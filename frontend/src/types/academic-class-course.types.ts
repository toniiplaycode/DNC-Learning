export interface AcademicClassCourse {
  id: number;
  classId: number;
  courseId: number;
  createdAt: string;
  updatedAt: string;
  academicClass: {
    id: number;
    className: string;
    classCode: string;
    instructors: Array<{
      id: number;
      fullName: string;
      professionalTitle: string;
    }>;
  };
  course: {
    id: number;
    title: string;
    description: string;
    thumbnailUrl: string;
    price: number;
    level: string;
    status: string;
    startDate: string;
    endDate: string;
    required: string;
    learned: string;
    category: {
      id: number;
      name: string;
      description: string;
      status: string;
    };
    instructor: {
      id: number;
      fullName: string;
      professionalTitle: string;
      specialization: string;
      bio: string;
      avatarUrl: string;
      user: {
        id: number;
        email: string;
        avatarUrl: string;
      };
    };
    sections: Array<{
      id: number;
      title: string;
      description: string;
      orderNumber: number;
      lessons: Array<{
        id: number;
        title: string;
        contentType: string;
        contentUrl: string;
        content: string;
        duration: number;
        orderNumber: number;
        isFree: boolean;
      }>;
    }>;
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
