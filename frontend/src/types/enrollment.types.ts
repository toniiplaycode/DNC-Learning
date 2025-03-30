import { Course } from "../../../backend/src/entities/Course";
import { User } from "../../../backend/src/entities/User";

export enum EnrollmentStatus {
  ACTIVE = "active",
  COMPLETED = "completed",
  DROPPED = "dropped",
}

export interface Enrollment {
  id: number;
  userId: number;
  courseId: number;
  enrollmentDate: string;
  status: EnrollmentStatus;
  completionDate?: string;
  progress: number;
  course?: Partial<Course>;
  user?: Partial<User>;
  createdAt: string;
  updatedAt: string;
}

export interface EnrollmentStats {
  totalEnrollments: number;
  completed: number;
  inProgress: number;
  dropped: number;
  averageProgress: number;
}

export interface EnrollmentParams {
  userId?: number;
  courseId?: number;
}

export interface CreateEnrollmentData {
  userId: number;
  courseId: number;
  status?: EnrollmentStatus;
  progress?: number;
}

export interface UpdateEnrollmentData {
  status?: EnrollmentStatus;
  completionDate?: string;
  progress?: number;
}

export interface UpdateProgressData {
  progress: number;
}
