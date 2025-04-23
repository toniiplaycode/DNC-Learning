import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../services/api";
import { AcademicClassCourse } from "../../types/academic-class-course.types";

interface AcademicClassCoursesState {
  classCourses: AcademicClassCourse[];
  currentClassCourses: AcademicClassCourse | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: AcademicClassCoursesState = {
  classCourses: [],
  currentClassCourses: null,
  status: "idle",
  error: null,
};

// Fetch all class courses
export const fetchClassCourses = createAsyncThunk(
  "academicClassCourses/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/academic-class-courses");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch class courses"
      );
    }
  }
);

// Fetch courses by class ID
export const fetchCoursesByClassId = createAsyncThunk(
  "academicClassCourses/fetchByClassId",
  async (classId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/academic-class-courses/class/${classId}/courses`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch class courses"
      );
    }
  }
);

// Create class course
export const createAcademicClassCourses = createAsyncThunk(
  "academicClassCourses/create",
  async (
    courseData: { classId: number; courseIds: number[] },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("/academic-class-courses", courseData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create class course"
      );
    }
  }
);

// Delete class course
export const deleteAcademicClassCourse = createAsyncThunk(
  "academicClassCourses/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/academic-class-courses/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete class course"
      );
    }
  }
);

const academicClassCoursesSlice = createSlice({
  name: "academicClassCourses",
  initialState,
  reducers: {
    resetState: (state) => {
      state.classCourses = [];
      state.currentClassCourses = null;
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
      .addCase(fetchClassCourses.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchClassCourses.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.classCourses = action.payload;
        state.error = null;
      })
      .addCase(fetchClassCourses.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch by class ID
      .addCase(fetchCoursesByClassId.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCoursesByClassId.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.classCourses = action.payload;
        state.error = null;
      })
      .addCase(fetchCoursesByClassId.rejected, (state, action) => {
        state.status = "failed";
        state.classCourses = [];
        state.error = action.payload as string;
      })

      // Create
      .addCase(createAcademicClassCourses.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createAcademicClassCourses.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.classCourses.push(...action.payload);
        state.error = null;
      })
      .addCase(createAcademicClassCourses.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Delete
      .addCase(deleteAcademicClassCourse.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteAcademicClassCourse.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.classCourses = state.classCourses.filter(
          (course) => course.id !== action.payload
        );
        state.error = null;
      })
      .addCase(deleteAcademicClassCourse.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const { resetState, clearError } = academicClassCoursesSlice.actions;

// Export reducer
export default academicClassCoursesSlice.reducer;
