import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../services/api";
import {
  ProgramCourse,
  CreateProgramCourseDto,
  UpdateProgramCourseDto,
} from "../../types/program-course.types";

interface ProgramCoursesState {
  programCourses: ProgramCourse[];
  currentProgramCourse: ProgramCourse | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: ProgramCoursesState = {
  programCourses: [],
  currentProgramCourse: null,
  status: "idle",
  error: null,
};

// Fetch all program courses
export const fetchProgramCourses = createAsyncThunk(
  "programCourses/fetchAll",
  async (
    { programId, courseId }: { programId?: number; courseId?: number } = {},
    { rejectWithValue }
  ) => {
    try {
      let url = "/program-courses";
      const params = new URLSearchParams();
      if (programId) params.append("programId", programId.toString());
      if (courseId) params.append("courseId", courseId.toString());
      if (params.toString()) url += `?${params.toString()}`;

      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch program courses"
      );
    }
  }
);

// Fetch program course by ID
export const fetchProgramCourseById = createAsyncThunk(
  "programCourses/fetchById",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/program-courses/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch program course"
      );
    }
  }
);

// Create program course
export const createProgramCourse = createAsyncThunk(
  "programCourses/create",
  async (data: CreateProgramCourseDto, { rejectWithValue }) => {
    try {
      const response = await api.post("/program-courses", data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create program course"
      );
    }
  }
);

// Update program course
export const updateProgramCourse = createAsyncThunk(
  "programCourses/update",
  async (
    { id, updateDto }: { id: number; updateDto: UpdateProgramCourseDto },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(`/program-courses/${id}`, updateDto);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update program course"
      );
    }
  }
);

// Delete program course
export const deleteProgramCourse = createAsyncThunk(
  "programCourses/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/program-courses/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete program course"
      );
    }
  }
);

// Delete program course by program and course IDs
export const deleteProgramCourseByProgramAndCourse = createAsyncThunk(
  "programCourses/deleteByProgramAndCourse",
  async (
    { programId, courseId }: { programId: number; courseId: number },
    { rejectWithValue }
  ) => {
    try {
      await api.delete(
        `/program-courses/program/${programId}/course/${courseId}`
      );
      return { programId, courseId };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to delete program course relationship"
      );
    }
  }
);

const programCoursesSlice = createSlice({
  name: "programCourses",
  initialState,
  reducers: {
    resetState: (state) => {
      state.programCourses = [];
      state.currentProgramCourse = null;
      state.status = "idle";
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchProgramCourses.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProgramCourses.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.programCourses = action.payload;
        state.error = null;
      })
      .addCase(fetchProgramCourses.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // Fetch by ID
      .addCase(fetchProgramCourseById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProgramCourseById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentProgramCourse = action.payload;
        state.error = null;
      })
      .addCase(fetchProgramCourseById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // Create
      .addCase(createProgramCourse.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createProgramCourse.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.programCourses.unshift(action.payload);
        state.error = null;
      })
      .addCase(createProgramCourse.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // Update
      .addCase(updateProgramCourse.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateProgramCourse.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.programCourses.findIndex(
          (pc) => pc.id === action.payload.id
        );
        if (index !== -1) {
          state.programCourses[index] = action.payload;
        }
        if (state.currentProgramCourse?.id === action.payload.id) {
          state.currentProgramCourse = action.payload;
        }
        state.error = null;
      })
      .addCase(updateProgramCourse.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // Delete
      .addCase(deleteProgramCourse.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteProgramCourse.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.programCourses = state.programCourses.filter(
          (pc) => pc.id !== action.payload
        );
        if (state.currentProgramCourse?.id === action.payload) {
          state.currentProgramCourse = null;
        }
        state.error = null;
      })
      .addCase(deleteProgramCourse.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // Delete by program and course
      .addCase(deleteProgramCourseByProgramAndCourse.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        deleteProgramCourseByProgramAndCourse.fulfilled,
        (state, action) => {
          state.status = "succeeded";
          state.programCourses = state.programCourses.filter(
            (pc) =>
              !(
                pc.programId === action.payload.programId &&
                pc.courseId === action.payload.courseId
              )
          );
          if (
            state.currentProgramCourse?.programId ===
              action.payload.programId &&
            state.currentProgramCourse?.courseId === action.payload.courseId
          ) {
            state.currentProgramCourse = null;
          }
          state.error = null;
        }
      )
      .addCase(
        deleteProgramCourseByProgramAndCourse.rejected,
        (state, action) => {
          state.status = "failed";
          state.error = action.payload as string;
        }
      );
  },
});

export const { resetState, clearError } = programCoursesSlice.actions;
export default programCoursesSlice.reducer;
