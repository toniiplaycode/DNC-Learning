import { RootState } from "../../store/store";

// Lấy tất cả khóa học
export const selectAllCourses = (state: RootState) => state.courses.courses;

// Lấy khóa học theo id
export const selectCourseById = (state: RootState) =>
  state.courses.currentCourse;

// Lấy khóa học theo giảng viên
export const selectCoursesByInstructor = (state: RootState) =>
  state.courses.coursesByInstructor;

// Lấy trạng thái loading
export const selectCoursesLoading = (state: RootState) => state.courses.status;

// Lấy trạng thái error
export const selectCoursesError = (state: RootState) => state.courses.error;

// Lấy khóa học đã publish
export const selectPublishedCourses = (state: RootState) =>
  state.courses.courses.filter((course) => course.status === "published");

// Lấy khóa học theo category
export const selectCoursesByCategory = (state: RootState, categoryId: number) =>
  state.courses.courses.filter((course) => course.categoryId === categoryId);
