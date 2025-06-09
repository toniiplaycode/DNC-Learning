import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../services/api";
import {
  Faculty,
  CreateFacultyDto,
  UpdateFacultyDto,
} from "../../types/faculty.types";

interface FacultiesState {
  faculties: Faculty[];
  currentFaculty: Faculty | null;
  instructorFaculty: Faculty | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  isInstructorFacultyLoading: boolean;
}

const initialState: FacultiesState = {
  faculties: [],
  currentFaculty: null,
  instructorFaculty: null,
  status: "idle",
  error: null,
  isInstructorFacultyLoading: false,
};

// Fetch all faculties
export const fetchFaculties = createAsyncThunk(
  "faculties/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/faculties");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch faculties"
      );
    }
  }
);

// Fetch faculty by ID
export const fetchFacultyById = createAsyncThunk(
  "faculties/fetchById",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/faculties/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch faculty"
      );
    }
  }
);

// Fetch faculty by code
export const fetchFacultyByCode = createAsyncThunk(
  "faculties/fetchByCode",
  async (code: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/faculties/code/${code}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch faculty"
      );
    }
  }
);

// Create faculty
export const createFaculty = createAsyncThunk(
  "faculties/create",
  async (facultyData: CreateFacultyDto, { rejectWithValue }) => {
    try {
      const response = await api.post("/faculties", facultyData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create faculty"
      );
    }
  }
);

// Update faculty
export const updateFaculty = createAsyncThunk(
  "faculties/update",
  async (
    data: { id: number; updateDto: UpdateFacultyDto },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(`/faculties/${data.id}`, data.updateDto);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update faculty"
      );
    }
  }
);

// Delete faculty
export const deleteFaculty = createAsyncThunk(
  "faculties/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/faculties/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete faculty"
      );
    }
  }
);

// Add new thunk for getting instructor's faculty
export const fetchInstructorFaculty = createAsyncThunk(
  "faculties/fetchInstructorFaculty",
  async (instructorId: number) => {
    const response = await api.get<Faculty | null>(
      `/faculties/instructor/${instructorId}`
    );
    return response.data;
  }
);

const facultiesSlice = createSlice({
  name: "faculties",
  initialState,
  reducers: {
    resetState: (state) => {
      state.faculties = [];
      state.currentFaculty = null;
      state.instructorFaculty = null;
      state.status = "idle";
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearInstructorFaculty: (state) => {
      state.instructorFaculty = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchFaculties.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchFaculties.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.faculties = action.payload;
        state.error = null;
      })
      .addCase(fetchFaculties.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // Fetch by ID
      .addCase(fetchFacultyById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchFacultyById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentFaculty = action.payload;
        state.error = null;
      })
      .addCase(fetchFacultyById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // Fetch by code
      .addCase(fetchFacultyByCode.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchFacultyByCode.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentFaculty = action.payload;
        state.error = null;
      })
      .addCase(fetchFacultyByCode.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // Create
      .addCase(createFaculty.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createFaculty.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.faculties.unshift(action.payload);
        state.error = null;
      })
      .addCase(createFaculty.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // Update
      .addCase(updateFaculty.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateFaculty.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.faculties.findIndex(
          (f) => f.id === action.payload.id
        );
        if (index !== -1) {
          state.faculties[index] = action.payload;
        }
        if (state.currentFaculty?.id === action.payload.id) {
          state.currentFaculty = action.payload;
        }
        state.error = null;
      })
      .addCase(updateFaculty.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // Delete
      .addCase(deleteFaculty.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteFaculty.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.faculties = state.faculties.filter(
          (f) => f.id !== action.payload
        );
        if (state.currentFaculty?.id === action.payload) {
          state.currentFaculty = null;
        }
        state.error = null;
      })
      .addCase(deleteFaculty.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // Fetch instructor faculty
      .addCase(fetchInstructorFaculty.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.isInstructorFacultyLoading = true;
      })
      .addCase(fetchInstructorFaculty.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.instructorFaculty = action.payload;
        state.isInstructorFacultyLoading = false;
      })
      .addCase(fetchInstructorFaculty.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.error.message || "Failed to fetch instructor faculty";
        state.isInstructorFacultyLoading = false;
      });
  },
});

export const { resetState, clearError, clearInstructorFaculty } =
  facultiesSlice.actions;
export default facultiesSlice.reducer;
