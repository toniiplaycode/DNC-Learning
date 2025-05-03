import { Course } from "./course.types";

// Các enum đã sử dụng trong entities backend
export enum UserRole {
  STUDENT = "student",
  STUDENT_ACADEMIC = "student_academic",
  INSTRUCTOR = "instructor",
  ADMIN = "admin",
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  BANNED = "banned",
}

export enum StudentStatus {
  STUDYING = "studying",
  GRADUATED = "graduated",
  SUSPENDED = "suspended",
  DROPPED = "dropped",
}

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
}

// User interface cho frontend
export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  userStudent?: UserStudent;
  userStudentAcademic?: UserStudentAcademic;
  userInstructor?: UserInstructor;
  enrollments?: Enrollment[];
}

// UserStudent interface cho frontend
export interface UserStudent {
  id: number;
  userId: number;
  fullName: string;
  dateOfBirth?: Date;
  gender?: Gender;
  educationLevel?: string;
  occupation?: string;
  bio?: string;
  address?: string;
  city?: string;
  country?: string;
  interests?: string;
  learningGoals?: string;
  preferredLanguage?: string;
  totalCoursesEnrolled: number;
  totalCoursesCompleted: number;
  achievementPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

// UserStudentAcademic interface cho frontend
export interface UserStudentAcademic {
  id: number;
  userId: number;
  academicClassId: number;
  studentCode: string;
  fullName: string;
  academicYear: string;
  status: StudentStatus;
  createdAt: Date;
  updatedAt: Date;
  academicClass?: AcademicClass;
}

// UserInstructor interface cho frontend
export interface UserInstructor {
  id: number;
  userId: number;
  fullName: string;
  bio?: string;
  specialization?: string;
  education?: string;
  experience?: string;
  website?: string;
  socialProfiles?: object;
  rating?: number;
  totalStudents?: number;
  totalCourses?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Enrollment interface cho frontend
export interface Enrollment {
  id: number;
  userId: number;
  courseId: number;
  enrollmentDate: Date;
  status: string;
  completionDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  course?: Course;
}

// AcademicClass interface
export interface AcademicClass {
  id: number;
  classCode: string;
  className: string;
  semester: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
