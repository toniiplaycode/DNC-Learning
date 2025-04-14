import { RootState } from "../../store/store";

// Lấy tất cả các phần khóa học
export const selectAllCourseSections = (state: RootState) =>
  state.courseSections.courseSections;

// Lấy phần khóa học theo id
export const selectCourseSectionById = (state: RootState) =>
  state.courseSections.currentCourseSection;

// Lấy tất cả các phần khóa học theo khóa học
export const selectAllCourseSectionsByCourseId = (state: RootState) =>
  state.courseSections.courseSections;

// Lấy trạng thái loading
export const selectCourseSectionsLoading = (state: RootState) =>
  state.courseSections.status;

// Lấy trạng thái error
export const selectCourseSectionsError = (state: RootState) =>
  state.courseSections.error;
