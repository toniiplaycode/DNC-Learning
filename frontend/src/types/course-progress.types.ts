export interface CourseProgress {
  id: number;
  userId: number;
  lessonId: number;
  completedAt: string;
  lastAccessed: string;
}

export interface CourseProgressState {
  progress: CourseProgress[];
  userProgress: CourseProgress[];
  currentProgress: CourseProgress | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}
