import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  CourseSection,
  fetchCourseSections,
  fetchCourseSectionById,
  createCourseSection,
  updateCourseSection,
  deleteCourseSection,
  fetchCourseSectionsByCourseId,
} from "./courseSectionApiSlice";

interface CourseSectionsState {
  courseSections: CourseSection[];
  currentCourseSection: CourseSection | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: CourseSectionsState = {
  courseSections: [],
  currentCourseSection: null,
  status: "idle",
  error: null,
};

const courseSectionsSlice = createSlice({
  name: "courseSections",
  initialState,
  reducers: {
    resetCourseSectionState: (state) => {
      state.currentCourseSection = null;
      state.error = null;
    },
    setCurrentCourseSection: (
      state,
      action: PayloadAction<CourseSection | null>
    ) => {
      state.currentCourseSection = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Xử lý fetchCourseSections
    builder
      .addCase(fetchCourseSections.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchCourseSections.fulfilled,
        (state, action: PayloadAction<CourseSection[]>) => {
          state.status = "succeeded";
          state.courseSections = action.payload;
          state.error = null;
        }
      )
      .addCase(fetchCourseSections.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) ||
          "Đã xảy ra lỗi khi tải danh sách phần khóa học";
      });

    // Xử lý fetchCourseSectionById
    builder
      .addCase(fetchCourseSectionById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchCourseSectionById.fulfilled,
        (state, action: PayloadAction<CourseSection>) => {
          state.status = "succeeded";
          state.currentCourseSection = action.payload;
          state.error = null;
        }
      )
      .addCase(fetchCourseSectionById.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) ||
          "Đã xảy ra lỗi khi tải thông tin phần khóa học";
      });

    // Xử lý fetchCourseSectionsByCourseId
    builder
      .addCase(fetchCourseSectionsByCourseId.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchCourseSectionsByCourseId.fulfilled,
        (state, action: PayloadAction<CourseSection[]>) => {
          state.status = "succeeded";
          state.courseSections = action.payload;
          state.error = null;
        }
      )
      .addCase(fetchCourseSectionsByCourseId.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) ||
          "Đã xảy ra lỗi khi tải danh sách phần khóa học theo ID khóa học";
      });

    // Xử lý createCourseSection
    builder
      .addCase(createCourseSection.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        createCourseSection.fulfilled,
        (state, action: PayloadAction<CourseSection>) => {
          state.status = "succeeded";
          state.courseSections.push(action.payload);
          state.currentCourseSection = action.payload;
          state.error = null;
        }
      )
      .addCase(createCourseSection.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) ||
          "Đã xảy ra lỗi khi tạo phần khóa học mới";
      });

    // Xử lý updateCourseSection
    builder
      .addCase(updateCourseSection.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        updateCourseSection.fulfilled,
        (state, action: PayloadAction<CourseSection>) => {
          state.status = "succeeded";
          const index = state.courseSections.findIndex(
            (courseSection) => courseSection.id === action.payload.id
          );
          if (index !== -1) {
            state.courseSections[index] = action.payload;
          }
          state.currentCourseSection = action.payload;
          state.error = null;
        }
      )
      .addCase(updateCourseSection.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) ||
          "Đã xảy ra lỗi khi cập nhật phần khóa học";
      });

    // Xử lý deleteCourseSection
    builder
      .addCase(deleteCourseSection.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        deleteCourseSection.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.status = "succeeded";
          state.courseSections = state.courseSections.filter(
            (courseSection) => courseSection.id !== action.payload
          );
          if (state.currentCourseSection?.id === action.payload) {
            state.currentCourseSection = null;
          }
          state.error = null;
        }
      )
      .addCase(deleteCourseSection.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || "Đã xảy ra lỗi khi xóa phần khóa học";
      });
  },
});

export const { resetCourseSectionState, setCurrentCourseSection } =
  courseSectionsSlice.actions;
export default courseSectionsSlice.reducer;
