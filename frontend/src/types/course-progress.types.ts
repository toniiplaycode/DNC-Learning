export interface CourseProgress {
  id: number;
  userId: number;
  lessonId: number;
  completedAt: string;
  lastAccessed: string;
}

export interface LastAccessedLesson {
  id: number;
  title: string;
}

export interface UserCourseProgressSummary {
  courseId: number;
  courseTitle: string;
  courseImage: string;
  totalLessons: number;
  completedLessons: number;
  completionPercentage: number;
  lastAccessedLesson: LastAccessedLesson | null;
  lastAccessTime: string | null;
}

export interface LessonProgressDetail {
  lessonId: number;
  title: string;
  orderNumber: number;
  contentType: string;
  duration: number;
  isFree: boolean;
  completed: boolean;
  lastAccessed: string | null;
  progressId: number | null;
}

export interface SectionProgressDetail {
  sectionId: number;
  title: string;
  description: string;
  orderNumber: number;
  totalLessons: number;
  completedLessons: number;
  completionPercentage: number;
  lessons: LessonProgressDetail[];
}

export interface CourseProgressDetail {
  courseId: number;
  courseTitle: string;
  courseImage: string;
  totalLessons: number;
  completedLessons: number;
  completionPercentage: number;
  lastAccessedLesson: LastAccessedLesson | null;
  lastAccessTime: string | null;
  sections: SectionProgressDetail[];
}

export interface CourseProgressState {
  progress: CourseProgress[];
  userProgress: CourseProgress[];
  userCourseProgress: UserCourseProgressSummary[];
  courseProgressDetail: CourseProgressDetail | null;
  currentProgress: CourseProgress | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}
