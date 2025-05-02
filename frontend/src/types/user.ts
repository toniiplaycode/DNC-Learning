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

export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Instructor {
  id: number;
  userId: number;
  fullName: string;
  professionalTitle?: string;
  specialization?: string;
  educationBackground?: string;
  teachingExperience?: string;
  bio?: string;
  expertiseAreas?: string;
  certificates?: string;
  linkedinProfile?: string;
  website?: string;
  verificationStatus: "pending" | "verified" | "rejected";
  verificationDocuments?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  averageRating?: string;
  totalReviews?: number;
  totalCourses?: number;
  totalStudents?: number;
}
