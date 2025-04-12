import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  Course,
  fetchCourses,
  fetchCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  fetchCoursesByInstructor,
} from "./coursesApiSlice";

interface CoursesState {
  courses: Course[];
  coursesByInstructor: Course[];
  currentCourse: Course | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: CoursesState = {
  courses: [],
  coursesByInstructor: [],
  currentCourse: null,
  status: "idle",
  error: null,
};

const coursesSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {
    resetCourseState: (state) => {
      state.currentCourse = null;
      state.error = null;
    },
    setCurrentCourse: (state, action: PayloadAction<Course | null>) => {
      state.currentCourse = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Xử lý fetchCourses
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchCourses.fulfilled,
        (state, action: PayloadAction<Course[]>) => {
          state.status = "succeeded";
          state.courses = action.payload;
          state.error = null;
        }
      )
      .addCase(fetchCourses.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) ||
          "Đã xảy ra lỗi khi tải danh sách khóa học";
      });

    // Xử lý fetchCourseById
    builder
      .addCase(fetchCourseById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchCourseById.fulfilled,
        (state, action: PayloadAction<Course>) => {
          state.status = "succeeded";
          state.currentCourse = action.payload;
          state.error = null;
        }
      )
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) ||
          "Đã xảy ra lỗi khi tải thông tin khóa học";
      });

    // Xử lý fetchCoursesByInstructor
    builder
      .addCase(fetchCoursesByInstructor.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCoursesByInstructor.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.coursesByInstructor = action.payload;
        state.error = null;
      })
      .addCase(fetchCoursesByInstructor.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) ||
          "Đã xảy ra lỗi khi tải danh sách khóa học";
      });

    // Xử lý createCourse
    builder
      .addCase(createCourse.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        createCourse.fulfilled,
        (state, action: PayloadAction<Course>) => {
          state.status = "succeeded";
          state.courses.push(action.payload);
          state.currentCourse = action.payload;
          state.error = null;
        }
      )
      .addCase(createCourse.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || "Đã xảy ra lỗi khi tạo khóa học mới";
      });

    // Xử lý updateCourse
    builder
      .addCase(updateCourse.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        updateCourse.fulfilled,
        (state, action: PayloadAction<Course>) => {
          state.status = "succeeded";
          const index = state.courses.findIndex(
            (course) => course.id === action.payload.id
          );
          if (index !== -1) {
            state.courses[index] = action.payload;
          }
          state.currentCourse = action.payload;
          state.error = null;
        }
      )
      .addCase(updateCourse.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || "Đã xảy ra lỗi khi cập nhật khóa học";
      });

    // Xử lý deleteCourse
    builder
      .addCase(deleteCourse.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        deleteCourse.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.status = "succeeded";
          state.courses = state.courses.filter(
            (course) => course.id !== action.payload
          );
          if (state.currentCourse?.id === action.payload) {
            state.currentCourse = null;
          }
          state.error = null;
        }
      )
      .addCase(deleteCourse.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || "Đã xảy ra lỗi khi xóa khóa học";
      });
  },
});

export const { resetCourseState, setCurrentCourse } = coursesSlice.actions;
export default coursesSlice.reducer;
