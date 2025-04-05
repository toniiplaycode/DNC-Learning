import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  Enrollment,
  EnrollmentStats,
  CreateEnrollmentData,
  UpdateEnrollmentData,
  UpdateProgressData,
} from "../../types/enrollment.types";
import { api } from "../../services/api";

export const fetchEnrollments = createAsyncThunk(
  "enrollments/fetchAll",
  async (_) => {
    try {
      const response = await api.get("/enrollments");
      return response.data;
    } catch (error) {
      return (error as Error).message || "Failed to fetch enrollments";
    }
  }
);

export const fetchUserEnrollments = createAsyncThunk(
  "enrollments/fetchUserEnrollments",
  async (userId: number) => {
    try {
      const response = await api.get(`/enrollments/user/${userId}`);
      return response.data;
    } catch (error) {
      return (error as Error).message || "Failed to fetch user enrollments";
    }
  }
);

export const fetchCourseEnrollments = createAsyncThunk(
  "enrollments/fetchCourseEnrollments",
  async (courseId: number) => {
    try {
      const response = await api.get(`/enrollments/course/${courseId}`);
      return response.data;
    } catch (error) {
      return (error as Error).message || "Failed to fetch course enrollments";
    }
  }
);

export const fetchEnrollmentStats = createAsyncThunk(
  "enrollments/fetchStats",
  async (userId: number) => {
    try {
      const response = await api.get(`/enrollments/stats/${userId}`);
      return response.data;
    } catch (error) {
      return (error as Error).message || "Failed to fetch enrollment stats";
    }
  }
);

export const enrollInCourse = createAsyncThunk(
  "enrollments/enroll",
  async (data: CreateEnrollmentData) => {
    try {
      const response = await api.post("/enrollments", data);
      return response.data;
    } catch (error) {
      return (error as Error).message || "Failed to enroll in course";
    }
  }
);

export const updateEnrollment = createAsyncThunk(
  "enrollments/update",
  async ({ id, data }: { id: number; data: UpdateEnrollmentData }) => {
    try {
      const response = await api.patch(`/enrollments/${id}`, data);
      return response.data;
    } catch (error) {
      return (error as Error).message || "Failed to update enrollment";
    }
  }
);

export const updateProgress = createAsyncThunk(
  "enrollments/updateProgress",
  async ({ id, data }: { id: number; data: UpdateProgressData }) => {
    try {
      const response = await api.patch(`/enrollments/${id}/progress`, data);
      return response.data;
    } catch (error) {
      return (error as Error).message || "Failed to update progress";
    }
  }
);

export const unenrollFromCourse = createAsyncThunk(
  "enrollments/unenroll",
  async (id: number) => {
    try {
      await api.delete(`/enrollments/${id}`);
      return id;
    } catch (error) {
      return (error as Error).message || "Failed to unenroll from course";
    }
  }
);

// Add new progress interfaces to your type definitions
export interface UserProgressParams {
  userId: number;
  courseId: number;
}

export interface CourseProgressParams {
  courseId: number;
}

// Add new thunks for progress endpoints
export const fetchUserProgress = createAsyncThunk(
  "enrollments/fetchUserProgress",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/enrollments/progress`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        (error as Error).message || "Failed to fetch user progress"
      );
    }
  }
);

export const fetchCourseProgress = createAsyncThunk(
  "enrollments/fetchCourseProgress",
  async ({ courseId }: CourseProgressParams, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/enrollments/progress/course/${courseId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        (error as Error).message || "Failed to fetch course progress"
      );
    }
  }
);

interface EnrollmentsState {
  enrollments: Enrollment[];
  userEnrollments: Enrollment[];
  courseEnrollments: Enrollment[];
  stats: EnrollmentStats | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  userProgress: any | null;
  courseProgress: any | null;
}

const initialState: EnrollmentsState = {
  enrollments: [],
  userEnrollments: [],
  courseEnrollments: [],
  stats: null,
  status: "idle",
  error: null,
  userProgress: null,
  courseProgress: null,
};

const enrollmentsSlice = createSlice({
  name: "enrollments",
  initialState,
  reducers: {
    resetEnrollmentsState: (state) => {
      state.enrollments = [];
      state.userEnrollments = [];
      state.courseEnrollments = [];
      state.stats = null;
      state.status = "idle";
      state.error = null;
    },
    resetProgressState: (state) => {
      state.userProgress = null;
      state.courseProgress = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all enrollments
      .addCase(fetchEnrollments.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchEnrollments.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.enrollments = action.payload;
        state.error = null;
      })
      .addCase(fetchEnrollments.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch user enrollments
      .addCase(fetchUserEnrollments.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUserEnrollments.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.userEnrollments = action.payload;
        state.error = null;
      })
      .addCase(fetchUserEnrollments.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch course enrollments
      .addCase(fetchCourseEnrollments.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCourseEnrollments.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.courseEnrollments = action.payload;
        state.error = null;
      })
      .addCase(fetchCourseEnrollments.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch enrollment stats
      .addCase(fetchEnrollmentStats.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchEnrollmentStats.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(fetchEnrollmentStats.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Enroll in course
      .addCase(enrollInCourse.pending, (state) => {
        state.status = "loading";
      })
      .addCase(enrollInCourse.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.userEnrollments.push(action.payload);
        state.error = null;
      })
      .addCase(enrollInCourse.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Update enrollment
      .addCase(updateEnrollment.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateEnrollment.fulfilled, (state, action) => {
        state.status = "succeeded";

        // Update in all enrollment arrays
        const updatedEnrollment = action.payload;

        state.enrollments = state.enrollments.map((enrollment) =>
          enrollment.id === updatedEnrollment.id
            ? updatedEnrollment
            : enrollment
        );

        state.userEnrollments = state.userEnrollments.map((enrollment) =>
          enrollment.id === updatedEnrollment.id
            ? updatedEnrollment
            : enrollment
        );

        state.courseEnrollments = state.courseEnrollments.map((enrollment) =>
          enrollment.id === updatedEnrollment.id
            ? updatedEnrollment
            : enrollment
        );

        state.error = null;
      })
      .addCase(updateEnrollment.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Update progress
      .addCase(updateProgress.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateProgress.fulfilled, (state, action) => {
        state.status = "succeeded";

        // Update in all enrollment arrays
        const updatedEnrollment = action.payload;

        state.enrollments = state.enrollments.map((enrollment) =>
          enrollment.id === updatedEnrollment.id
            ? updatedEnrollment
            : enrollment
        );

        state.userEnrollments = state.userEnrollments.map((enrollment) =>
          enrollment.id === updatedEnrollment.id
            ? updatedEnrollment
            : enrollment
        );

        state.courseEnrollments = state.courseEnrollments.map((enrollment) =>
          enrollment.id === updatedEnrollment.id
            ? updatedEnrollment
            : enrollment
        );

        state.error = null;
      })
      .addCase(updateProgress.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Unenroll from course
      .addCase(unenrollFromCourse.pending, (state) => {
        state.status = "loading";
      })
      .addCase(unenrollFromCourse.fulfilled, (state, action) => {
        state.status = "succeeded";
        const id = action.payload;

        state.enrollments = state.enrollments.filter(
          (enrollment) => enrollment.id !== id
        );
        state.userEnrollments = state.userEnrollments.filter(
          (enrollment) => enrollment.id !== id
        );
        state.courseEnrollments = state.courseEnrollments.filter(
          (enrollment) => enrollment.id !== id
        );

        state.error = null;
      })
      .addCase(unenrollFromCourse.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Handle fetchUserProgress
      .addCase(fetchUserProgress.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUserProgress.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.userProgress = action.payload;
        state.error = null;
      })
      .addCase(fetchUserProgress.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Handle fetchCourseProgress
      .addCase(fetchCourseProgress.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCourseProgress.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.courseProgress = action.payload;
        state.error = null;
      })
      .addCase(fetchCourseProgress.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { resetEnrollmentsState, resetProgressState } =
  enrollmentsSlice.actions;

export default enrollmentsSlice.reducer;
