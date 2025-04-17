import { RootState } from "../../store/store";

// Lấy tất cả các bài học
export const selectAllCourseLessons = (state: RootState) =>
  state.courseLessons.courseLessons;

// Lấy bài học theo id
export const selectCourseLessonById = (state: RootState) =>
  state.courseLessons.currentCourseLesson;

// Lấy trạng thái loading
export const selectCourseLessonsLoading = (state: RootState) =>
  state.courseLessons.status;

// Lấy trạng thái error
export const selectCourseLessonsError = (state: RootState) =>
  state.courseLessons.error;

// Lấy các quizz của một course
export const selectAlCourseLessonlQuizzes = (state: RootState) =>
  state.courseLessons.quizzes;
