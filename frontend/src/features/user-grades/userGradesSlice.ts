import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  UserGradeState,
  CreateUserGradeData,
  UpdateUserGradeData,
  GradeType,
} from "../../types/user-grade.types";
import { api } from "../../services/api";

// Async thunks
export const fetchUserGrades = createAsyncThunk(
  "userGrades/fetchAll",
  async (
    {
      userId,
      courseId,
      gradeType,
    }: { userId?: number; courseId?: number; gradeType?: GradeType },
    { rejectWithValue }
  ) => {
    try {
      const params: Record<string, string> = {};
      if (userId) params.userId = String(userId);
      if (courseId) params.courseId = String(courseId);
      if (gradeType) params.gradeType = gradeType;

      const response = await api.get("/user-grades", { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải điểm số"
      );
    }
  }
);

export const fetchUserCourseGrades = createAsyncThunk(
  "userGrades/fetchUserCourseGrades",
  async (
    { userId, courseId }: { userId: number; courseId: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get(
        `/user-grades/user/${userId}/course/${courseId}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải điểm số của khóa học"
      );
    }
  }
);

export const fetchUserGradesByUser = createAsyncThunk(
  "userGrades/fetchUserGradesByUser",
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/user-grades/user/${userId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải điểm số của người dùng"
      );
    }
  }
);

export const fetchGradeById = createAsyncThunk(
  "userGrades/fetchById",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/user-grades/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải thông tin điểm số"
      );
    }
  }
);

export const fetchCourseSummary = createAsyncThunk(
  "userGrades/fetchCourseSummary",
  async (
    { userId, courseId }: { userId: number; courseId: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get(
        `/user-grades/user/${userId}/course/${courseId}/summary`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải bảng điểm tổng hợp"
      );
    }
  }
);

export const fetchPerformanceStats = createAsyncThunk(
  "userGrades/fetchPerformanceStats",
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/user-grades/student/performance?userId=${userId}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Không thể tải thống kê hiệu suất học tập"
      );
    }
  }
);

export const createUserGrade = createAsyncThunk(
  "userGrades/create",
  async (gradeData: CreateUserGradeData, { rejectWithValue }) => {
    try {
      const response = await api.post("/user-grades", gradeData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tạo điểm số"
      );
    }
  }
);

export const updateUserGrade = createAsyncThunk(
  "userGrades/update",
  async (
    { id, gradeData }: { id: number; gradeData: UpdateUserGradeData },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(`/user-grades/${id}`, gradeData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể cập nhật điểm số"
      );
    }
  }
);

export const deleteUserGrade = createAsyncThunk(
  "userGrades/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/user-grades/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể xóa điểm số"
      );
    }
  }
);

export const fetchInstructorGrades = createAsyncThunk(
  "userGrades/fetchInstructorGrades",
  async (instructorId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/user-grades/instructor/${instructorId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể lấy danh sách điểm đã chấm"
      );
    }
  }
);

export const fetchGradeBySubmission = createAsyncThunk(
  "userGrades/fetchGradeBySubmission",
  async (submissionId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/user-grades/submission/${submissionId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Không thể lấy thông tin điểm của bài nộp"
      );
    }
  }
);

// Initial state
const initialState: UserGradeState = {
  userGrades: [],
  courseGrades: [],
  userCourseGrades: [],
  currentGrade: null,
  courseSummary: null,
  performanceStats: null,
  status: "idle",
  error: null,
  instructorGrades: [],
  submissionGrade: null,
};

// Slice
const userGradesSlice = createSlice({
  name: "userGrades",
  initialState,
  reducers: {
    resetUserGradesState: (state) => {
      return initialState;
    },
    clearUserGradesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchUserGrades
      .addCase(fetchUserGrades.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUserGrades.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.userGrades = action.payload;
        state.error = null;
      })
      .addCase(fetchUserGrades.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // fetchUserCourseGrades
      .addCase(fetchUserCourseGrades.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUserCourseGrades.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.userCourseGrades = action.payload;
        state.error = null;
      })
      .addCase(fetchUserCourseGrades.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // fetchUserGradesByUser
      .addCase(fetchUserGradesByUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUserGradesByUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.userGrades = action.payload;
        state.error = null;
      })
      .addCase(fetchUserGradesByUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // fetchGradeById
      .addCase(fetchGradeById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchGradeById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentGrade = action.payload;
        state.error = null;
      })
      .addCase(fetchGradeById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // fetchCourseSummary
      .addCase(fetchCourseSummary.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCourseSummary.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.courseSummary = action.payload;
        state.error = null;
      })
      .addCase(fetchCourseSummary.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // fetchPerformanceStats
      .addCase(fetchPerformanceStats.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPerformanceStats.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.performanceStats = action.payload;
        state.error = null;
      })
      .addCase(fetchPerformanceStats.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // createUserGrade
      .addCase(createUserGrade.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createUserGrade.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.userGrades.push(action.payload);

        // Thêm vào danh sách khóa học nếu cùng courseId
        if (
          state.courseGrades.length > 0 &&
          state.courseGrades[0].courseId === action.payload.courseId
        ) {
          state.courseGrades.push(action.payload);
        }

        // Thêm vào danh sách user-course nếu cùng courseId và userId
        if (
          state.userCourseGrades.length > 0 &&
          state.userCourseGrades[0].courseId === action.payload.courseId &&
          state.userCourseGrades[0].userId === action.payload.userId
        ) {
          state.userCourseGrades.push(action.payload);
        }

        state.error = null;
      })
      .addCase(createUserGrade.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // updateUserGrade
      .addCase(updateUserGrade.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateUserGrade.fulfilled, (state, action) => {
        state.status = "succeeded";
        const updatedGrade = action.payload;

        // Cập nhật trong tất cả các danh sách
        state.userGrades = state.userGrades.map((grade) =>
          grade.id === updatedGrade.id ? updatedGrade : grade
        );

        state.courseGrades = state.courseGrades.map((grade) =>
          grade.id === updatedGrade.id ? updatedGrade : grade
        );

        state.userCourseGrades = state.userCourseGrades.map((grade) =>
          grade.id === updatedGrade.id ? updatedGrade : grade
        );

        if (state.currentGrade?.id === updatedGrade.id) {
          state.currentGrade = updatedGrade;
        }

        state.error = null;
      })
      .addCase(updateUserGrade.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // deleteUserGrade
      .addCase(deleteUserGrade.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteUserGrade.fulfilled, (state, action) => {
        state.status = "succeeded";
        const id = action.payload;

        // Xóa khỏi tất cả các danh sách
        state.userGrades = state.userGrades.filter((grade) => grade.id !== id);
        state.courseGrades = state.courseGrades.filter(
          (grade) => grade.id !== id
        );
        state.userCourseGrades = state.userCourseGrades.filter(
          (grade) => grade.id !== id
        );

        if (state.currentGrade?.id === id) {
          state.currentGrade = null;
        }

        state.error = null;
      })
      .addCase(deleteUserGrade.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // fetchInstructorGrades
      .addCase(fetchInstructorGrades.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchInstructorGrades.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.instructorGrades = action.payload;
        state.error = null;
      })
      .addCase(fetchInstructorGrades.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // fetchGradeBySubmission
      .addCase(fetchGradeBySubmission.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchGradeBySubmission.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.submissionGrade = action.payload;
        state.error = null;
      })
      .addCase(fetchGradeBySubmission.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { resetUserGradesState, clearUserGradesError } =
  userGradesSlice.actions;

export default userGradesSlice.reducer;
