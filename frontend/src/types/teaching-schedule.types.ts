import { User } from "./user.types";

export enum ScheduleStatus {
  SCHEDULED = "scheduled",
  IN_PROGRESS = "in-progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export interface AcademicClass {
  id: number;
  classCode: string;
  className: string;
  semester: string;
  status: string;
}

export interface UserInstructor {
  id: number;
  userId: number;
  fullName: string;
  professionalTitle?: string;
  specialization?: string;
  user?: User;
}

export interface AcademicClassInstructor {
  id: number;
  classId: number;
  instructorId: number;
  instructor?: UserInstructor;
  academicClass?: AcademicClass;
}

export interface AcademicClassCourse {
  id: number;
  classId: number;
  courseId: number;
  course?: {
    id: number;
    title: string;
  };
}

export interface RecurringPattern {
  frequency: "daily" | "weekly" | "monthly";
  days?: number[]; // 1-7 for Monday-Sunday
  interval: number; // Repeat every X days/weeks/months
  until: string; // Date until which the pattern repeats
}

export interface TeachingSchedule {
  id: number;
  academicClassId: number;
  academicClassInstructorId: number;
  academicClassCourseId?: number;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  meetingLink?: string;
  meetingId?: string;
  meetingPassword?: string;
  status: ScheduleStatus;
  isRecurring: boolean;
  recurringPattern?: RecurringPattern;
  recordingUrl?: string;
  createdAt: string;
  updatedAt: string;
  academicClass?: AcademicClass;
  academicClassInstructor?: AcademicClassInstructor;
  academicClassCourse?: AcademicClassCourse;
}

export interface CreateTeachingScheduleData {
  academicClassId: number;
  academicClassInstructorId: number;
  academicClassCourseId?: number;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  meetingLink?: string;
  meetingId?: string;
  meetingPassword?: string;
  status?: ScheduleStatus;
  isRecurring?: boolean;
  recurringPattern?: string; // JSON string
  sendNotification?: boolean;
  notificationTime?: string;
}

export interface UpdateTeachingScheduleData {
  academicClassId?: number;
  academicClassInstructorId?: number;
  academicClassCourseId?: number;
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  meetingLink?: string;
  meetingId?: string;
  meetingPassword?: string;
  status?: ScheduleStatus;
  isRecurring?: boolean;
  recurringPattern?: string; // JSON string
}

export interface TeachingScheduleState {
  teachingSchedules: TeachingSchedule[];
  classSchedules: TeachingSchedule[];
  instructorSchedules: TeachingSchedule[];
  studentSchedules: TeachingSchedule[];
  currentSchedule: TeachingSchedule | null;
  instructorDetails: UserInstructor | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}
