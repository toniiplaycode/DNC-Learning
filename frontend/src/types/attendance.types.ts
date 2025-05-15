// Define the enum to match backend
export enum AttendanceStatus {
  PRESENT = "present",
  ABSENT = "absent",
  LATE = "late",
  EXCUSED = "excused",
}

// Define the session attendance interface
export interface SessionAttendance {
  id: number;
  scheduleId: number;
  studentAcademicId: number;
  status: AttendanceStatus;
  joinTime?: Date;
  leaveTime?: Date;
  durationMinutes?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  teachingSchedule?: {
    id: number;
    title: string;
    startTime: Date;
    endTime: Date;
  };
  studentAcademic?: {
    id: number;
    studentId: number;
    fullName: string;
    avatarUrl: string;
  };
}

// Define TeachingScheduleWithAttendance interface
export interface TeachingScheduleWithAttendance {
  id: number;
  courseId: number;
  courseName: string;
  instructorId: number;
  instructorName: string;
  instructorAvatar: string;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  endDateTime: Date;
  duration: number;
  meetingUrl?: string;
  meetingId?: string;
  meetingPassword?: string;
  recordingUrl?: string;
  status: string;
  totalStudents: number;
  attendedStudents: number;
  createdAt: Date;
  updatedAt: Date;
  attendances: SessionAttendance[];
  userAttendance?: SessionAttendance; // Property to track current user's attendance
}

// Define the state interface
export interface SessionAttendanceState {
  attendances: SessionAttendance[];
  currentAttendance: SessionAttendance | null;
  stats: {
    scheduleStats: {
      totalStudents: number;
      present: number;
      absent: number;
      late: number;
      excused: number;
    } | null;
    studentStats: {
      totalSessions: number;
      attended: number;
      absent: number;
      late: number;
      excused: number;
      attendancePercentage: number;
    } | null;
  };
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

export interface AttendanceRecord {
  id: number;
  status: AttendanceStatus;
  studentAcademic?: {
    id: number;
    userId?: number;
    user?: {
      id: string;
      fullName?: string;
      avatarUrl?: string;
    };
  };
  durationMinutes?: number;
  checkInTime?: string;
  checkOutTime?: string;
  createdAt: Date;
  updatedAt: Date;
}
