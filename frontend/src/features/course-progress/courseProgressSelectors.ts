import { RootState } from "../../store/store";
import { CourseProgress } from "../../types/course-progress.types";

// Select all progress
export const selectAllProgress = (state: RootState): CourseProgress[] =>
  state.courseProgress.progress;

// Select user progress
export const selectUserProgress = (state: RootState): CourseProgress[] =>
  state.courseProgress.userProgress;

// Select current progress
export const selectCurrentProgress = (
  state: RootState
): CourseProgress | null => state.courseProgress.currentProgress;

// Select progress status
export const selectProgressStatus = (state: RootState): string =>
  state.courseProgress.status;

// Select progress error
export const selectProgressError = (state: RootState): string | null =>
  state.courseProgress.error;

// Select progress by lesson ID
export const selectProgressByLessonId =
  (lessonId: number) =>
  (state: RootState): CourseProgress | undefined =>
    state.courseProgress.progress.find(
      (progress: CourseProgress) => progress.lessonId === lessonId
    );

// Select user progress by lesson ID
export const selectUserProgressByLessonId =
  (lessonId: number) =>
  (state: RootState): CourseProgress | undefined =>
    state.courseProgress.userProgress.find(
      (progress: CourseProgress) => progress.lessonId === lessonId
    );

// Select completed lessons count
export const selectCompletedLessonsCount = (state: RootState): number =>
  state.courseProgress.userProgress.filter(
    (progress: CourseProgress) => progress.completedAt !== null
  ).length;

// Select total lessons count
export const selectTotalLessonsCount = (state: RootState): number =>
  state.courseProgress.userProgress.length;

// Select completion percentage
export const selectCompletionPercentage = (state: RootState): number => {
  const completed = selectCompletedLessonsCount(state);
  const total = selectTotalLessonsCount(state);
  return total > 0 ? Math.round((completed / total) * 100) : 0;
};

// Select is lesson completed
export const selectIsLessonCompleted =
  (lessonId: number) =>
  (state: RootState): boolean =>
    state.courseProgress.userProgress.some(
      (progress: CourseProgress) =>
        progress.lessonId === lessonId && progress.completedAt !== null
    );

// Select last accessed lesson
export const selectLastAccessedLesson = (
  state: RootState
): CourseProgress | undefined =>
  state.courseProgress.userProgress.reduce(
    (latest: CourseProgress | undefined, current: CourseProgress) => {
      if (!latest) return current;
      if (!current.lastAccessed) return latest;
      if (!latest.lastAccessed) return current;
      return new Date(current.lastAccessed) > new Date(latest.lastAccessed)
        ? current
        : latest;
    },
    undefined as CourseProgress | undefined
  );
