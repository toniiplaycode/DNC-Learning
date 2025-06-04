import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../services/api";
import { Major, CreateMajorDto, UpdateMajorDto } from "../../types/major.types";

interface MajorsState {
  majors: Major[];
  currentMajor: Major | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: MajorsState = {
  majors: [],
  currentMajor: null,
  status: "idle",
  error: null,
};

// Fetch all majors
export const fetchMajors = createAsyncThunk(
  "majors/fetchAll",
  async ({ facultyId }: { facultyId?: number } = {}, { rejectWithValue }) => {
    try {
      const url = facultyId ? `/majors?facultyId=${facultyId}` : "/majors";
      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch majors"
      );
    }
  }
);

// Fetch major by ID
export const fetchMajorById = createAsyncThunk(
  "majors/fetchById",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/majors/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch major"
      );
    }
  }
);

// Fetch major by code
export const fetchMajorByCode = createAsyncThunk(
  "majors/fetchByCode",
  async (code: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/majors/code/${code}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch major"
      );
    }
  }
);

// Create major
export const createMajor = createAsyncThunk(
  "majors/create",
  async (majorData: CreateMajorDto, { rejectWithValue }) => {
    try {
      const response = await api.post("/majors", majorData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create major"
      );
    }
  }
);

// Update major
export const updateMajor = createAsyncThunk(
  "majors/update",
  async (
    data: { id: number; updateDto: UpdateMajorDto },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(`/majors/${data.id}`, data.updateDto);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update major"
      );
    }
  }
);

// Delete major
export const deleteMajor = createAsyncThunk(
  "majors/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/majors/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete major"
      );
    }
  }
);

const majorsSlice = createSlice({
  name: "majors",
  initialState,
  reducers: {
    resetState: (state) => {
      state.majors = [];
      state.currentMajor = null;
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
      .addCase(fetchMajors.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMajors.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.majors = action.payload;
        state.error = null;
      })
      .addCase(fetchMajors.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // Fetch by ID
      .addCase(fetchMajorById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMajorById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentMajor = action.payload;
        state.error = null;
      })
      .addCase(fetchMajorById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // Fetch by code
      .addCase(fetchMajorByCode.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMajorByCode.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentMajor = action.payload;
        state.error = null;
      })
      .addCase(fetchMajorByCode.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // Create
      .addCase(createMajor.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createMajor.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.majors.unshift(action.payload);
        state.error = null;
      })
      .addCase(createMajor.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // Update
      .addCase(updateMajor.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateMajor.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.majors.findIndex(
          (major: Major) => major.id === action.payload.id
        );
        if (index !== -1) {
          state.majors[index] = action.payload;
        }
        if (state.currentMajor?.id === action.payload.id) {
          state.currentMajor = action.payload;
        }
        state.error = null;
      })
      .addCase(updateMajor.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // Delete
      .addCase(deleteMajor.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteMajor.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.majors = state.majors.filter(
          (major: Major) => major.id !== action.payload
        );
        if (state.currentMajor?.id === action.payload) {
          state.currentMajor = null;
        }
        state.error = null;
      })
      .addCase(deleteMajor.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { resetState, clearError } = majorsSlice.actions;
export default majorsSlice.reducer;
