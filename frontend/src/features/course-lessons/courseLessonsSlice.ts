import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  CourseLesson,
  fetchCourseLessons,
  fetchCourseLessonById,
  createCourseLesson,
  updateCourseLesson,
  deleteCourseLesson,
  fetchCourseQuizzes,
} from "./courseLessonsApiSlice";
import { Quiz } from "../../types/quiz.types";

interface QuizLesson extends CourseLesson {
  quizzes?: Quiz[];
}

interface CourseLessonsState {
  courseLessons: CourseLesson[];
  quizzes: QuizLesson[];
  currentCourseLesson: CourseLesson | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: CourseLessonsState = {
  courseLessons: [],
  quizzes: [],
  currentCourseLesson: null,
  status: "idle",
  error: null,
};

const courseLessonsSlice = createSlice({
  name: "courseLessons",
  initialState,
  reducers: {
    resetCourseLessonState: (state) => {
      state.currentCourseLesson = null;
      state.error = null;
    },
    setCurrentCourseLesson: (
      state,
      action: PayloadAction<CourseLesson | null>
    ) => {
      state.currentCourseLesson = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all course lessons
      .addCase(fetchCourseLessons.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchCourseLessons.fulfilled,
        (state, action: PayloadAction<CourseLesson[]>) => {
          state.status = "succeeded";
          state.courseLessons = action.payload;
          state.error = null;
        }
      )
      .addCase(fetchCourseLessons.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) ||
          "Đã xảy ra lỗi khi tải danh sách bài học";
      })
      // Fetch course lesson by ID
      .addCase(fetchCourseLessonById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchCourseLessonById.fulfilled,
        (state, action: PayloadAction<CourseLesson>) => {
          state.status = "succeeded";
          state.currentCourseLesson = action.payload;
          state.error = null;
        }
      )
      .addCase(fetchCourseLessonById.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || "Đã xảy ra lỗi khi tải bài học theo ID";
      })

      .addCase(fetchCourseQuizzes.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCourseQuizzes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.quizzes = action.payload;
        state.error = null;
      })
      .addCase(fetchCourseQuizzes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Create a new course lesson
      .addCase(createCourseLesson.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        createCourseLesson.fulfilled,
        (state, action: PayloadAction<CourseLesson>) => {
          state.status = "succeeded";
          state.courseLessons.push(action.payload);
          state.currentCourseLesson = action.payload;
          state.error = null;
        }
      )
      .addCase(createCourseLesson.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || "Đã xảy ra lỗi khi tạo bài học mới";
      })
      // Update course lesson
      .addCase(updateCourseLesson.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        updateCourseLesson.fulfilled,
        (state, action: PayloadAction<CourseLesson>) => {
          state.status = "succeeded";
          const index = state.courseLessons.findIndex(
            (lesson) => lesson.id === action.payload.id
          );
          if (index !== -1) {
            state.courseLessons[index] = action.payload;
          }
          state.currentCourseLesson = action.payload;
          state.error = null;
        }
      )
      .addCase(updateCourseLesson.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || "Đã xảy ra lỗi khi cập nhật bài học";
      })
      // Delete course lesson
      .addCase(deleteCourseLesson.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        deleteCourseLesson.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.status = "succeeded";
          state.courseLessons = state.courseLessons.filter(
            (lesson) => lesson.id !== action.payload
          );
          if (state.currentCourseLesson?.id === action.payload) {
            state.currentCourseLesson = null;
          }
          state.error = null;
        }
      )
      .addCase(deleteCourseLesson.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || "Đã xảy ra lỗi khi xóa bài học";
      });
  },
});

export const { resetCourseLessonState, setCurrentCourseLesson } =
  courseLessonsSlice.actions;

export default courseLessonsSlice.reducer;
