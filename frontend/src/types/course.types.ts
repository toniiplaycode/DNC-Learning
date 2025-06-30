import { UserInstructor } from "./user.types";

// Enums
export enum CourseLevel {
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced",
}

export enum CourseStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

// Interfaces
export interface Course {
  id: number;
  title: string;
  description?: string;
  categoryId: number;
  instructorId: number;
  price: number;
  level?: CourseLevel;
  status: CourseStatus;
  for: string;
  thumbnailUrl?: string;
  required?: string;
  learned?: string;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  instructor?: UserInstructor;
  category?: Category;
  sections?: CourseSection[];
  enrollments?: Enrollment[];
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  parentId?: number;

  // Relations
  courses?: Course[];
}

export interface CourseSection {
  id: number;
  courseId: number;
  title: string;
  orderIndex: number;

  // Relations
  course?: Course;
  lessons?: CourseLesson[];
}

export interface CourseLesson {
  id: number;
  sectionId: number;
  title: string;
  content?: string;
  duration?: number;
  orderIndex: number;
  videoUrl?: string;

  // Relations
  section?: CourseSection;
}

export interface Enrollment {
  id: number;
  userId: number;
  courseId: number;
  enrollmentDate: Date;
  status: string;
  completionDate?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  course?: Course;
}
