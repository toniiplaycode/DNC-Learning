import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../services/api";
import {
  AttendanceStatus,
  SessionAttendanceState,
  SessionAttendance,
} from "../../types/attendance.types";

// Async thunks
export const fetchAttendances = createAsyncThunk(
  "sessionAttendances/fetchAll",
  async (
    {
      scheduleId,
      studentAcademicId,
    }: { scheduleId?: number; studentAcademicId?: number },
    { rejectWithValue }
  ) => {
    try {
      const queryParams = new URLSearchParams();
      if (scheduleId) queryParams.append("scheduleId", scheduleId.toString());
      if (studentAcademicId)
        queryParams.append("studentAcademicId", studentAcademicId.toString());

      const response = await api.get(`/session-attendances?${queryParams}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải dữ liệu điểm danh"
      );
    }
  }
);

export const fetchAttendanceById = createAsyncThunk(
  "sessionAttendances/fetchById",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/session-attendances/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải thông tin điểm danh"
      );
    }
  }
);

export const createAttendance = createAsyncThunk(
  "sessionAttendances/create",
  async (data: Partial<SessionAttendance>, { rejectWithValue }) => {
    try {
      const response = await api.post("/session-attendances", data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tạo điểm danh"
      );
    }
  }
);

export const updateAttendance = createAsyncThunk(
  "sessionAttendances/update",
  async (
    { id, data }: { id: number; data: Partial<SessionAttendance> },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(`/session-attendances/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể cập nhật điểm danh"
      );
    }
  }
);

export const deleteAttendance = createAsyncThunk(
  "sessionAttendances/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/session-attendances/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể xóa điểm danh"
      );
    }
  }
);

export const markAttendance = createAsyncThunk(
  "sessionAttendances/markAttendance",
  async (
    data: {
      scheduleId: number;
      studentAcademicId: number;
      status: AttendanceStatus;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(
        "/session-attendances/mark-attendance",
        data
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể đánh dấu điểm danh"
      );
    }
  }
);

export const markLeave = createAsyncThunk(
  "sessionAttendances/markLeave",
  async (
    data: { scheduleId: number; studentAcademicId: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("/session-attendances/mark-leave", data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể đánh dấu kết thúc điểm danh"
      );
    }
  }
);

export const getScheduleAttendanceStats = createAsyncThunk(
  "sessionAttendances/getScheduleStats",
  async (scheduleId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/session-attendances/schedule/${scheduleId}/stats`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Không thể tải thống kê điểm danh lớp học"
      );
    }
  }
);

export const getStudentAttendanceStats = createAsyncThunk(
  "sessionAttendances/getStudentStats",
  async (studentAcademicId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/session-attendances/student/${studentAcademicId}/stats`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Không thể tải thống kê điểm danh học viên"
      );
    }
  }
);

const initialState: SessionAttendanceState = {
  attendances: [],
  currentAttendance: null,
  stats: {
    scheduleStats: null,
    studentStats: null,
  },
  status: "idle",
  error: null,
};

const sessionAttendancesSlice = createSlice({
  name: "sessionAttendances",
  initialState,
  reducers: {
    resetSessionAttendancesState: (state) => {
      state.attendances = [];
      state.currentAttendance = null;
      state.stats = {
        scheduleStats: null,
        studentStats: null,
      };
      state.status = "idle";
      state.error = null;
    },
    clearSessionAttendancesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all attendances
      .addCase(fetchAttendances.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAttendances.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.attendances = action.payload;
        state.error = null;
      })
      .addCase(fetchAttendances.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch attendance by id
      .addCase(fetchAttendanceById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAttendanceById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentAttendance = action.payload;
        state.error = null;
      })
      .addCase(fetchAttendanceById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Create attendance
      .addCase(createAttendance.fulfilled, (state, action) => {
        state.attendances.push(action.payload);
        state.error = null;
      })

      // Update attendance
      .addCase(updateAttendance.fulfilled, (state, action) => {
        const updatedAttendance = action.payload;
        state.attendances = state.attendances.map((attendance) =>
          attendance.id === updatedAttendance.id
            ? updatedAttendance
            : attendance
        );
        if (state.currentAttendance?.id === updatedAttendance.id) {
          state.currentAttendance = updatedAttendance;
        }
        state.error = null;
      })

      // Delete attendance
      .addCase(deleteAttendance.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.attendances = state.attendances.filter(
          (attendance) => attendance.id !== deletedId
        );
        if (state.currentAttendance?.id === deletedId) {
          state.currentAttendance = null;
        }
        state.error = null;
      })

      // Mark attendance
      .addCase(markAttendance.fulfilled, (state, action) => {
        const updatedAttendance = action.payload;
        const index = state.attendances.findIndex(
          (attendance) =>
            attendance.scheduleId === updatedAttendance.scheduleId &&
            attendance.studentAcademicId === updatedAttendance.studentAcademicId
        );

        if (index >= 0) {
          state.attendances[index] = updatedAttendance;
        } else {
          state.attendances.push(updatedAttendance);
        }
        state.error = null;
      })

      // Mark leave
      .addCase(markLeave.fulfilled, (state, action) => {
        const updatedAttendance = action.payload;
        state.attendances = state.attendances.map((attendance) =>
          attendance.scheduleId === updatedAttendance.scheduleId &&
          attendance.studentAcademicId === updatedAttendance.studentAcademicId
            ? updatedAttendance
            : attendance
        );
        state.error = null;
      })

      // Schedule stats
      .addCase(getScheduleAttendanceStats.fulfilled, (state, action) => {
        state.stats.scheduleStats = action.payload;
        state.error = null;
      })

      // Student stats
      .addCase(getStudentAttendanceStats.fulfilled, (state, action) => {
        state.stats.studentStats = action.payload;
        state.error = null;
      });
  },
});

export const { resetSessionAttendancesState, clearSessionAttendancesError } =
  sessionAttendancesSlice.actions;
export default sessionAttendancesSlice.reducer;
