import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../services/api";
import {
  AcademicClassInstructor,
  CreateClassInstructorDto,
  UpdateClassInstructorDto,
} from "../../types/academic-class-instructor.types";

interface AcademicClassInstructorsState {
  classInstructors: AcademicClassInstructor[];
  currentClassInstructor: AcademicClassInstructor | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: AcademicClassInstructorsState = {
  classInstructors: [],
  currentClassInstructor: null,
  status: "idle",
  error: null,
};

// Thunks
export const fetchClassInstructors = createAsyncThunk(
  "academicClassInstructors/fetchAll",
  async (
    params: { classId?: number; instructorId?: number } = {},
    { rejectWithValue }
  ) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.classId)
        queryParams.append("classId", params.classId.toString());
      if (params.instructorId)
        queryParams.append("instructorId", params.instructorId.toString());

      const response = await api.get(
        `/academic-class-instructors?${queryParams}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch class instructors"
      );
    }
  }
);

export const fetchClassInstructorById = createAsyncThunk(
  "academicClassInstructors/fetchOne",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/academic-class-instructors?instructorId=${id}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch class instructor"
      );
    }
  }
);

export const createClassInstructor = createAsyncThunk(
  "academicClassInstructors/create",
  async (data: CreateClassInstructorDto, { rejectWithValue }) => {
    try {
      const response = await api.post("/academic-class-instructors", data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create class instructor"
      );
    }
  }
);

export const updateClassInstructor = createAsyncThunk(
  "academicClassInstructors/update",
  async (
    { id, data }: { id: number; data: UpdateClassInstructorDto },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(
        `/academic-class-instructors/${id}`,
        data
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update class instructor"
      );
    }
  }
);

export const deleteClassInstructor = createAsyncThunk(
  "academicClassInstructors/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/academic-class-instructors/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete class instructor"
      );
    }
  }
);

const academicClassInstructorsSlice = createSlice({
  name: "academicClassInstructors",
  initialState,
  reducers: {
    resetState: (state) => {
      state.classInstructors = [];
      state.currentClassInstructor = null;
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
      .addCase(fetchClassInstructors.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchClassInstructors.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.classInstructors = action.payload;
        state.error = null;
      })
      .addCase(fetchClassInstructors.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // Fetch one
      .addCase(fetchClassInstructorById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchClassInstructorById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentClassInstructor = action.payload;
        state.error = null;
      })
      .addCase(fetchClassInstructorById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // Create
      .addCase(createClassInstructor.fulfilled, (state, action) => {
        state.classInstructors.push(action.payload);
        state.error = null;
      })
      // Update
      .addCase(updateClassInstructor.fulfilled, (state, action) => {
        const index = state.classInstructors.findIndex(
          (ci) => ci.id === action.payload.id
        );
        if (index !== -1) {
          state.classInstructors[index] = action.payload;
        }
        if (state.currentClassInstructor?.id === action.payload.id) {
          state.currentClassInstructor = action.payload;
        }
        state.error = null;
      })
      // Delete
      .addCase(deleteClassInstructor.fulfilled, (state, action) => {
        state.classInstructors = state.classInstructors.filter(
          (ci) => ci.id !== action.payload
        );
        if (state.currentClassInstructor?.id === action.payload) {
          state.currentClassInstructor = null;
        }
        state.error = null;
      });
  },
});

export const { resetState, clearError } = academicClassInstructorsSlice.actions;
export default academicClassInstructorsSlice.reducer;
