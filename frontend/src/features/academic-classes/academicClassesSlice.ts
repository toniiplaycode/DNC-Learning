import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../services/api";
import {
  AcademicClass,
  CreateAcademicClassDto,
  UpdateAcademicClassDto,
} from "../../types/academic-class.types";

interface AcademicClassesState {
  academicClasses: AcademicClass[];
  currentClass: AcademicClass | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: AcademicClassesState = {
  academicClasses: [],
  currentClass: null,
  status: "idle",
  error: null,
};

// Fetch all academic classes
export const fetchAcademicClasses = createAsyncThunk(
  "academicClasses/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/academic-classes");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch classes"
      );
    }
  }
);

// Fetch academic class by ID
export const fetchAcademicClassById = createAsyncThunk(
  "academicClasses/fetchById",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/academic-classes/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch class"
      );
    }
  }
);

// Create academic class
export const createAcademicClass = createAsyncThunk(
  "academicClasses/create",
  async (classData: any, { rejectWithValue }) => {
    try {
      const response = await api.post("/academic-classes", classData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create class"
      );
    }
  }
);

// Update academic class
export const updateAcademicClass = createAsyncThunk(
  "academicClasses/update",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await api.put(`/academic-classes/${data.id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update class"
      );
    }
  }
);

// Delete academic class
export const deleteAcademicClass = createAsyncThunk(
  "academicClasses/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/academic-classes/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete class"
      );
    }
  }
);

const academicClassesSlice = createSlice({
  name: "academicClasses",
  initialState,
  reducers: {
    resetState: (state) => {
      state.academicClasses = [];
      state.currentClass = null;
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
      .addCase(fetchAcademicClasses.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAcademicClasses.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.academicClasses = action.payload;
        state.error = null;
      })
      .addCase(fetchAcademicClasses.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // Fetch by ID
      .addCase(fetchAcademicClassById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAcademicClassById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentClass = action.payload;
        state.error = null;
      })
      .addCase(fetchAcademicClassById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // Create
      .addCase(createAcademicClass.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createAcademicClass.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.academicClasses.unshift(action.payload);
        state.error = null;
      })
      .addCase(createAcademicClass.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // Update
      .addCase(updateAcademicClass.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateAcademicClass.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.academicClasses.findIndex(
          (c) => c.id === action.payload.id
        );
        if (index !== -1) {
          state.academicClasses[index] = action.payload;
        }
        if (state.currentClass?.id === action.payload.id) {
          state.currentClass = action.payload;
        }
        state.error = null;
      })
      .addCase(updateAcademicClass.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // Delete
      .addCase(deleteAcademicClass.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteAcademicClass.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.academicClasses = state.academicClasses.filter(
          (c) => c.id !== action.payload
        );
        if (state.currentClass?.id === action.payload) {
          state.currentClass = null;
        }
        state.error = null;
      })
      .addCase(deleteAcademicClass.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { resetState, clearError } = academicClassesSlice.actions;
export default academicClassesSlice.reducer;
