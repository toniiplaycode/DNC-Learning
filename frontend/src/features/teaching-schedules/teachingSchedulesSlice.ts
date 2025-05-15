import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  TeachingScheduleState,
  CreateTeachingScheduleData,
  UpdateTeachingScheduleData,
  ScheduleStatus,
} from "../../types/teaching-schedule.types";
import { api } from "../../services/api";

// Async thunks
export const fetchAllTeachingSchedules = createAsyncThunk(
  "teachingSchedules/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/teaching-schedules");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải lịch dạy"
      );
    }
  }
);

export const fetchTeachingScheduleById = createAsyncThunk(
  "teachingSchedules/fetchById",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/teaching-schedules/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải chi tiết lịch dạy"
      );
    }
  }
);

export const fetchTeachingSchedulesByClass = createAsyncThunk(
  "teachingSchedules/fetchByClass",
  async (academicClassId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/teaching-schedules?academicClassId=${academicClassId}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Không thể tải lịch dạy cho lớp học này"
      );
    }
  }
);

export const fetchTeachingSchedulesByInstructor = createAsyncThunk(
  "teachingSchedules/fetchByInstructor",
  async (instructorId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/teaching-schedules/instructor/${instructorId}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Không thể tải lịch dạy của giảng viên này"
      );
    }
  }
);

export const fetchInstructorDetails = createAsyncThunk(
  "teachingSchedules/fetchInstructorDetails",
  async (scheduleId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/teaching-schedules/${scheduleId}/instructor`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải thông tin giảng viên"
      );
    }
  }
);

export const createTeachingSchedule = createAsyncThunk(
  "teachingSchedules/create",
  async (scheduleData: CreateTeachingScheduleData, { rejectWithValue }) => {
    try {
      const response = await api.post("/teaching-schedules", scheduleData);
      console.log(response.data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tạo lịch dạy"
      );
    }
  }
);

export const updateTeachingSchedule = createAsyncThunk(
  "teachingSchedules/update",
  async (
    { id, updateData }: { id: number; updateData: UpdateTeachingScheduleData },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(`/teaching-schedules/${id}`, updateData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể cập nhật lịch dạy"
      );
    }
  }
);

export const updateScheduleStatus = createAsyncThunk(
  "teachingSchedules/updateStatus",
  async (
    { id, status }: { id: number; status: ScheduleStatus },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(`/teaching-schedules/${id}/status`, {
        status,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Không thể cập nhật trạng thái lịch dạy"
      );
    }
  }
);

export const addRecordingUrl = createAsyncThunk(
  "teachingSchedules/addRecording",
  async (
    { id, recordingUrl }: { id: number; recordingUrl: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(`/teaching-schedules/${id}/recording`, {
        recordingUrl,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể thêm URL ghi lại buổi học"
      );
    }
  }
);

export const deleteTeachingSchedule = createAsyncThunk(
  "teachingSchedules/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/teaching-schedules/${id}`);
      return id; // Trả về ID để xóa khỏi state
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể xóa lịch dạy"
      );
    }
  }
);

export const fetchTeachingSchedulesByStudent = createAsyncThunk(
  "teachingSchedules/fetchByStudent",
  async (userStudentAcademicId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/teaching-schedules/student/${userStudentAcademicId}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Không thể tải lịch học của sinh viên này"
      );
    }
  }
);

// Initial state
const initialState: TeachingScheduleState = {
  teachingSchedules: [],
  classSchedules: [],
  instructorSchedules: [],
  studentSchedules: [],
  currentSchedule: null,
  instructorDetails: null,
  status: "idle",
  error: null,
};

// Slice
const teachingSchedulesSlice = createSlice({
  name: "teachingSchedules",
  initialState,
  reducers: {
    resetTeachingSchedulesState: (state) => {
      state.teachingSchedules = [];
      state.classSchedules = [];
      state.instructorSchedules = [];
      state.studentSchedules = [];
      state.currentSchedule = null;
      state.instructorDetails = null;
      state.status = "idle";
      state.error = null;
    },
    clearTeachingSchedulesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all teaching schedules
      .addCase(fetchAllTeachingSchedules.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAllTeachingSchedules.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.teachingSchedules = action.payload;
        state.error = null;
      })
      .addCase(fetchAllTeachingSchedules.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch by ID
      .addCase(fetchTeachingScheduleById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTeachingScheduleById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentSchedule = action.payload;
        state.error = null;
      })
      .addCase(fetchTeachingScheduleById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch by class
      .addCase(fetchTeachingSchedulesByClass.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTeachingSchedulesByClass.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.classSchedules = action.payload;
        state.error = null;
      })
      .addCase(fetchTeachingSchedulesByClass.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch by instructor
      .addCase(fetchTeachingSchedulesByInstructor.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchTeachingSchedulesByInstructor.fulfilled,
        (state, action) => {
          state.status = "succeeded";
          state.instructorSchedules = action.payload;
          state.error = null;
        }
      )
      .addCase(fetchTeachingSchedulesByInstructor.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch instructor details
      .addCase(fetchInstructorDetails.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchInstructorDetails.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.instructorDetails = action.payload;
        state.error = null;
      })
      .addCase(fetchInstructorDetails.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Create
      .addCase(createTeachingSchedule.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createTeachingSchedule.fulfilled, (state, action) => {
        state.status = "succeeded";
        const newSchedule = action.payload;
        state.teachingSchedules.push(newSchedule);

        // Thêm vào danh sách lớp nếu đang xem lớp tương ứng
        if (
          state.classSchedules.length > 0 &&
          state.classSchedules[0].academicClassId ===
            newSchedule.academicClassId
        ) {
          state.classSchedules.push(newSchedule);
        }

        // Thêm vào danh sách giảng viên nếu đang xem giảng viên tương ứng
        if (
          state.instructorSchedules.length > 0 &&
          state.instructorSchedules[0].academicClassInstructor?.instructor
            ?.id === newSchedule.academicClassInstructor?.instructor?.id
        ) {
          state.instructorSchedules.push(newSchedule);
        }

        state.error = null;
      })
      .addCase(createTeachingSchedule.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Update
      .addCase(updateTeachingSchedule.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateTeachingSchedule.fulfilled, (state, action) => {
        state.status = "succeeded";
        const updatedSchedule = action.payload;

        // Cập nhật trong các mảng
        state.teachingSchedules = state.teachingSchedules.map((schedule) =>
          schedule.id === updatedSchedule.id ? updatedSchedule : schedule
        );

        state.classSchedules = state.classSchedules.map((schedule) =>
          schedule.id === updatedSchedule.id ? updatedSchedule : schedule
        );

        state.instructorSchedules = state.instructorSchedules.map((schedule) =>
          schedule.id === updatedSchedule.id ? updatedSchedule : schedule
        );

        if (state.currentSchedule?.id === updatedSchedule.id) {
          state.currentSchedule = updatedSchedule;
        }

        state.error = null;
      })
      .addCase(updateTeachingSchedule.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Update status
      .addCase(updateScheduleStatus.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateScheduleStatus.fulfilled, (state, action) => {
        state.status = "succeeded";
        const updatedSchedule = action.payload;

        // Cập nhật trong các mảng
        state.teachingSchedules = state.teachingSchedules.map((schedule) =>
          schedule.id === updatedSchedule.id ? updatedSchedule : schedule
        );

        state.classSchedules = state.classSchedules.map((schedule) =>
          schedule.id === updatedSchedule.id ? updatedSchedule : schedule
        );

        state.instructorSchedules = state.instructorSchedules.map((schedule) =>
          schedule.id === updatedSchedule.id ? updatedSchedule : schedule
        );

        if (state.currentSchedule?.id === updatedSchedule.id) {
          state.currentSchedule = updatedSchedule;
        }

        state.error = null;
      })
      .addCase(updateScheduleStatus.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Add recording URL
      .addCase(addRecordingUrl.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addRecordingUrl.fulfilled, (state, action) => {
        state.status = "succeeded";
        const updatedSchedule = action.payload;

        // Cập nhật trong các mảng
        state.teachingSchedules = state.teachingSchedules.map((schedule) =>
          schedule.id === updatedSchedule.id ? updatedSchedule : schedule
        );

        state.classSchedules = state.classSchedules.map((schedule) =>
          schedule.id === updatedSchedule.id ? updatedSchedule : schedule
        );

        state.instructorSchedules = state.instructorSchedules.map((schedule) =>
          schedule.id === updatedSchedule.id ? updatedSchedule : schedule
        );

        if (state.currentSchedule?.id === updatedSchedule.id) {
          state.currentSchedule = updatedSchedule;
        }

        state.error = null;
      })
      .addCase(addRecordingUrl.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Delete
      .addCase(deleteTeachingSchedule.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteTeachingSchedule.fulfilled, (state, action) => {
        state.status = "succeeded";
        const id = action.payload;

        // Xóa khỏi các mảng
        state.teachingSchedules = state.teachingSchedules.filter(
          (schedule) => schedule.id !== id
        );

        state.classSchedules = state.classSchedules.filter(
          (schedule) => schedule.id !== id
        );

        state.instructorSchedules = state.instructorSchedules.filter(
          (schedule) => schedule.id !== id
        );

        if (state.currentSchedule?.id === id) {
          state.currentSchedule = null;
        }

        state.error = null;
      })
      .addCase(deleteTeachingSchedule.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch by student
      .addCase(fetchTeachingSchedulesByStudent.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTeachingSchedulesByStudent.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.studentSchedules = action.payload;
        state.error = null;
      })
      .addCase(fetchTeachingSchedulesByStudent.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { resetTeachingSchedulesState, clearTeachingSchedulesError } =
  teachingSchedulesSlice.actions;

export default teachingSchedulesSlice.reducer;
