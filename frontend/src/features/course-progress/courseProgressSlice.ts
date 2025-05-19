import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  CourseProgressState,
  AllUserCourseProgress,
} from "../../types/course-progress.types";
import { api } from "../../services/api";

// Async thunks
export const fetchAllProgress = createAsyncThunk(
  "courseProgress/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/course-progress");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải tiến độ khóa học"
      );
    }
  }
);

export const fetchUserProgress = createAsyncThunk(
  "courseProgress/fetchByUser",
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/course-progress/user/${userId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải tiến độ của người dùng"
      );
    }
  }
);

export const fetchUserCourseProgress = createAsyncThunk(
  "courseProgress/fetchUserCourseProgress",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/course-progress/user-course-progress`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Không thể tải tiến độ khóa học của người dùng"
      );
    }
  }
);

export const createProgress = createAsyncThunk(
  "courseProgress/create",
  async (data: { userId: number; lessonId: number }, { rejectWithValue }) => {
    try {
      const response = await api.post("/course-progress", data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tạo tiến độ"
      );
    }
  }
);

export const markAsCompleted = createAsyncThunk(
  "courseProgress/markAsCompleted",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.put(`/course-progress/${id}/complete`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể đánh dấu hoàn thành"
      );
    }
  }
);

export const updateLastAccessed = createAsyncThunk(
  "courseProgress/updateLastAccessed",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.put(`/course-progress/${id}/last-accessed`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể cập nhật thời gian truy cập"
      );
    }
  }
);

export const deleteProgress = createAsyncThunk(
  "courseProgress/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/course-progress/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể xóa tiến độ"
      );
    }
  }
);

export const fetchCourseProgressDetail = createAsyncThunk(
  "courseProgress/fetchCourseProgressDetail",
  async ({ courseId }: { courseId: number }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/course-progress/user-course-progress/course/${courseId}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Không thể tải chi tiết tiến độ khóa học"
      );
    }
  }
);

export const fetchAllUsersCourseProgress = createAsyncThunk(
  "courseProgress/fetchAllUsersCourseProgress",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/course-progress/all-progress");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Không thể tải tiến độ học tập của tất cả học viên"
      );
    }
  }
);

const initialState: CourseProgressState = {
  progress: [],
  userProgress: [],
  userCourseProgress: [],
  courseProgressDetail: null,
  currentProgress: null,
  status: "idle",
  error: null,
  allUsersCourseProgress: [],
};

const courseProgressSlice = createSlice({
  name: "courseProgress",
  initialState,
  reducers: {
    resetProgressState: (state) => {
      state.progress = [];
      state.userProgress = [];
      state.userCourseProgress = [];
      state.courseProgressDetail = null;
      state.currentProgress = null;
      state.status = "idle";
      state.error = null;
    },
    clearProgressError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all progress
      .addCase(fetchAllProgress.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAllProgress.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.progress = action.payload;
        state.error = null;
      })
      .addCase(fetchAllProgress.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch user progress
      .addCase(fetchUserProgress.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUserProgress.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.userProgress = action.payload;
        state.error = null;
      })
      .addCase(fetchUserProgress.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Get user course progress summary
      .addCase(fetchUserCourseProgress.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUserCourseProgress.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.userCourseProgress = action.payload;
        state.error = null;
      })
      .addCase(fetchUserCourseProgress.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Create progress
      .addCase(createProgress.fulfilled, (state, action) => {
        state.progress.push(action.payload);
        if (
          state.userProgress.length > 0 &&
          action.payload.userId === state.userProgress[0]?.userId
        ) {
          state.userProgress.push(action.payload);
        }
      })

      // Mark as completed
      .addCase(markAsCompleted.fulfilled, (state, action) => {
        const updatedProgress = action.payload;
        state.progress = state.progress.map((progress) =>
          progress.id === updatedProgress.id ? updatedProgress : progress
        );
        state.userProgress = state.userProgress.map((progress) =>
          progress.id === updatedProgress.id ? updatedProgress : progress
        );
      })

      // Update last accessed
      .addCase(updateLastAccessed.fulfilled, (state, action) => {
        const updatedProgress = action.payload;
        state.progress = state.progress.map((progress) =>
          progress.id === updatedProgress.id ? updatedProgress : progress
        );
        state.userProgress = state.userProgress.map((progress) =>
          progress.id === updatedProgress.id ? updatedProgress : progress
        );
      })

      // Delete progress
      .addCase(deleteProgress.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.progress = state.progress.filter(
          (progress) => progress.id !== deletedId
        );
        state.userProgress = state.userProgress.filter(
          (progress) => progress.id !== deletedId
        );
        state.error = null;
      })

      // Fetch course progress detail
      .addCase(fetchCourseProgressDetail.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCourseProgressDetail.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.courseProgressDetail = action.payload;
        state.error = null;
      })
      .addCase(fetchCourseProgressDetail.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch all users course progress
      .addCase(fetchAllUsersCourseProgress.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAllUsersCourseProgress.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.allUsersCourseProgress = action.payload;
        state.error = null;
      })
      .addCase(fetchAllUsersCourseProgress.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { resetProgressState, clearProgressError } =
  courseProgressSlice.actions;
export default courseProgressSlice.reducer;
