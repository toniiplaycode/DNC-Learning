import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../services/api";
import {
  Program,
  CreateProgramDto,
  UpdateProgramDto,
  AddCourseToProgramDto,
  UpdateProgramCourseDto,
} from "../../types/program.types";

interface ProgramsState {
  programs: Program[];
  currentProgram: Program | null;
  studentAcademicProgram: Program | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: ProgramsState = {
  programs: [],
  currentProgram: null,
  studentAcademicProgram: null,
  status: "idle",
  error: null,
};

// Fetch all programs
export const fetchPrograms = createAsyncThunk(
  "programs/fetchAll",
  async ({ majorId }: { majorId?: number } = {}, { rejectWithValue }) => {
    try {
      const url = majorId ? `/programs?majorId=${majorId}` : "/programs";
      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch programs"
      );
    }
  }
);

// Fetch program by ID
export const fetchProgramById = createAsyncThunk(
  "programs/fetchById",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/programs/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch program"
      );
    }
  }
);

// Fetch program by code
export const fetchProgramByCode = createAsyncThunk(
  "programs/fetchByCode",
  async (code: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/programs/code/${code}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch program"
      );
    }
  }
);

// Create program
export const createProgram = createAsyncThunk(
  "programs/create",
  async (programData: CreateProgramDto, { rejectWithValue }) => {
    try {
      const response = await api.post("/programs", programData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create program"
      );
    }
  }
);

// Update program
export const updateProgram = createAsyncThunk(
  "programs/update",
  async (
    data: { id: number; updateDto: UpdateProgramDto },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(`/programs/${data.id}`, data.updateDto);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update program"
      );
    }
  }
);

// Delete program
export const deleteProgram = createAsyncThunk(
  "programs/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/programs/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete program"
      );
    }
  }
);

// Add course to program
export const addCourseToProgram = createAsyncThunk(
  "programs/addCourse",
  async (
    data: {
      programId: number;
      courseId: number;
      courseData: AddCourseToProgramDto;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(
        `/programs/${data.programId}/courses/${data.courseId}`,
        data.courseData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add course to program"
      );
    }
  }
);

// Remove course from program
export const removeCourseFromProgram = createAsyncThunk(
  "programs/removeCourse",
  async (
    data: { programId: number; courseId: number },
    { rejectWithValue }
  ) => {
    try {
      await api.delete(`/programs/${data.programId}/courses/${data.courseId}`);
      return { programId: data.programId, courseId: data.courseId };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove course from program"
      );
    }
  }
);

// Update program course
export const updateProgramCourse = createAsyncThunk(
  "programs/updateCourse",
  async (
    data: {
      programId: number;
      courseId: number;
      courseData: UpdateProgramCourseDto;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(
        `/programs/${data.programId}/courses/${data.courseId}`,
        data.courseData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update program course"
      );
    }
  }
);

// Fetch student academic program
export const fetchStudentAcademicProgram = createAsyncThunk(
  "programs/fetchStudentAcademicProgram",
  async (studentAcademicId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/programs/student-academic/${studentAcademicId}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch student academic program"
      );
    }
  }
);

const programsSlice = createSlice({
  name: "programs",
  initialState,
  reducers: {
    resetState: (state) => {
      state.programs = [];
      state.currentProgram = null;
      state.studentAcademicProgram = null;
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
      .addCase(fetchPrograms.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPrograms.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.programs = action.payload;
        state.error = null;
      })
      .addCase(fetchPrograms.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // Fetch by ID
      .addCase(fetchProgramById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProgramById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentProgram = action.payload;
        state.error = null;
      })
      .addCase(fetchProgramById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // Fetch by code
      .addCase(fetchProgramByCode.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProgramByCode.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentProgram = action.payload;
        state.error = null;
      })
      .addCase(fetchProgramByCode.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // Create
      .addCase(createProgram.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createProgram.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.programs.unshift(action.payload);
        state.error = null;
      })
      .addCase(createProgram.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // Update
      .addCase(updateProgram.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateProgram.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.programs.findIndex(
          (program) => program.id === action.payload.id
        );
        if (index !== -1) {
          state.programs[index] = action.payload;
        }
        if (state.currentProgram?.id === action.payload.id) {
          state.currentProgram = action.payload;
        }
        state.error = null;
      })
      .addCase(updateProgram.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // Delete
      .addCase(deleteProgram.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteProgram.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.programs = state.programs.filter(
          (program) => program.id !== action.payload
        );
        if (state.currentProgram?.id === action.payload) {
          state.currentProgram = null;
        }
        state.error = null;
      })
      .addCase(deleteProgram.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // Add course
      .addCase(addCourseToProgram.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addCourseToProgram.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (state.currentProgram?.id === action.payload.programId) {
          const program = state.currentProgram!;
          program.programCourses = program.programCourses || [];
          program.programCourses.push(action.payload);
        }
        state.error = null;
      })
      .addCase(addCourseToProgram.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // Remove course
      .addCase(removeCourseFromProgram.pending, (state) => {
        state.status = "loading";
      })
      .addCase(removeCourseFromProgram.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (state.currentProgram?.id === action.payload.programId) {
          state.currentProgram.programCourses =
            state.currentProgram.programCourses?.filter(
              (pc) => pc.courseId !== action.payload.courseId
            );
        }
        state.error = null;
      })
      .addCase(removeCourseFromProgram.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // Update course
      .addCase(updateProgramCourse.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateProgramCourse.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (state.currentProgram?.id === action.payload.programId) {
          const program = state.currentProgram!;
          if (program.programCourses) {
            const index = program.programCourses.findIndex(
              (pc) => pc.courseId === action.payload.courseId
            );
            if (index !== -1) {
              program.programCourses[index] = action.payload;
            }
          }
        }
        state.error = null;
      })
      .addCase(updateProgramCourse.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // Fetch student academic program
      .addCase(fetchStudentAcademicProgram.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchStudentAcademicProgram.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.studentAcademicProgram = action.payload;
        state.error = null;
      })
      .addCase(fetchStudentAcademicProgram.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { resetState, clearError } = programsSlice.actions;
export default programsSlice.reducer;
