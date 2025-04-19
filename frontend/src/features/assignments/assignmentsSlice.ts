import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  AssignmentsState,
  CreateAssignmentData,
  UpdateAssignmentData,
} from "../../types/assignment.types";
import { api } from "../../services/api";

// Initial state
const initialState: AssignmentsState = {
  assignments: [],
  currentAssignment: null,
  lessonAssignments: [],
  academicClassAssignments: [],
  studentAcademicAssignments: [],
  assignmentsCourse: [],
  userSubmissions: [],
  currentSubmission: null,
  status: "idle",
  error: null,
};

// Async thunks
export const fetchAssignments = createAsyncThunk(
  "assignments/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/assignments");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải danh sách bài tập"
      );
    }
  }
);

export const fetchAssignmentById = createAsyncThunk(
  "assignments/fetchById",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/assignments/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải chi tiết bài tập"
      );
    }
  }
);

export const fetchAssignmentsByLesson = createAsyncThunk(
  "assignments/fetchByLesson",
  async (lessonId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/assignments/lesson/${lessonId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải bài tập cho bài học"
      );
    }
  }
);

export const fetchAssignmentsByAcademicClass = createAsyncThunk(
  "assignments/fetchByAcademicClass",
  async (academicClassId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/assignments?academicClassId=${academicClassId}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải bài tập cho lớp học"
      );
    }
  }
);

// Async thunk để lấy assignments cho sinh viên học thuật
export const fetchAssignmentsByStudentAcademic = createAsyncThunk(
  "assignments/fetchByStudentAcademic",
  async (studentAcademicId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/assignments/student-academic/${studentAcademicId}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Không thể tải bài tập cho sinh viên học thuật"
      );
    }
  }
);

// Async thunk để lấy assignments khóa học
export const fetchAssignmentByCourse = createAsyncThunk(
  "assignments/fetchAssignmentByCourse",
  async (courseId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/assignments/course/${courseId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải bài tập "
      );
    }
  }
);

export const createAssignment = createAsyncThunk(
  "assignments/create",
  async (assignmentData: CreateAssignmentData, { rejectWithValue }) => {
    try {
      const response = await api.post("/assignments", assignmentData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tạo bài tập mới"
      );
    }
  }
);

export const updateAssignment = createAsyncThunk(
  "assignments/update",
  async (updateData: UpdateAssignmentData, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        `/assignments/${Number(updateData.id)}`,
        updateData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể cập nhật bài tập"
      );
    }
  }
);

export const deleteAssignment = createAsyncThunk(
  "assignments/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/assignments/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể xóa bài tập"
      );
    }
  }
);

// Assignment slice
const assignmentsSlice = createSlice({
  name: "assignments",
  initialState,
  reducers: {
    resetAssignmentsState: (state) => {
      state.status = "idle";
      state.error = null;
    },
    clearAssignmentsError: (state) => {
      state.error = null;
    },
    clearCurrentAssignment: (state) => {
      state.currentAssignment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all assignments
      .addCase(fetchAssignments.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAssignments.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.assignments = action.payload;
        state.error = null;
      })
      .addCase(fetchAssignments.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch assignment by id
      .addCase(fetchAssignmentById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAssignmentById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentAssignment = action.payload;
        state.error = null;
      })
      .addCase(fetchAssignmentById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch assignments by lesson
      .addCase(fetchAssignmentsByLesson.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAssignmentsByLesson.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.lessonAssignments = action.payload;
        state.error = null;
      })
      .addCase(fetchAssignmentsByLesson.rejected, (state, action) => {
        state.status = "failed";
        state.lessonAssignments = [];
        state.error = action.payload as string;
      })

      // Fetch assignments by academic class
      .addCase(fetchAssignmentsByAcademicClass.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAssignmentsByAcademicClass.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.academicClassAssignments = action.payload;
        state.error = null;
      })
      .addCase(fetchAssignmentsByAcademicClass.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch assignments by student academic
      .addCase(fetchAssignmentsByStudentAcademic.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAssignmentsByStudentAcademic.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.studentAcademicAssignments = action.payload;
        state.error = null;
      })
      .addCase(fetchAssignmentsByStudentAcademic.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch assignments by course
      .addCase(fetchAssignmentByCourse.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAssignmentByCourse.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.assignmentsCourse = action.payload;
        state.error = null;
      })
      .addCase(fetchAssignmentByCourse.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Create assignment
      .addCase(createAssignment.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createAssignment.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.assignments.push(action.payload);
        state.error = null;
      })
      .addCase(createAssignment.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Update assignment
      .addCase(updateAssignment.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateAssignment.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Update assignment in assignments array
        const index = state.assignments.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.assignments[index] = action.payload;
        }
        // Update current assignment if it matches
        if (
          state.currentAssignment &&
          state.currentAssignment.id === action.payload.id
        ) {
          state.currentAssignment = action.payload;
        }
        state.error = null;
      })
      .addCase(updateAssignment.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Delete assignment
      .addCase(deleteAssignment.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteAssignment.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Remove from assignments array
        state.assignments = state.assignments.filter(
          (item) => item.id !== action.payload
        );
        // Clear current assignment if it matches
        if (
          state.currentAssignment &&
          state.currentAssignment.id === action.payload
        ) {
          state.currentAssignment = null;
        }
        state.error = null;
      })
      .addCase(deleteAssignment.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const {
  resetAssignmentsState,
  clearAssignmentsError,
  clearCurrentAssignment,
} = assignmentsSlice.actions;

export default assignmentsSlice.reducer;
