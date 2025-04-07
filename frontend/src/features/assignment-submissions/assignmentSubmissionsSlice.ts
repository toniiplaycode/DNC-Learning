import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  CreateSubmissionData,
  UpdateSubmissionData,
  GradeSubmissionData,
  AssignmentSubmissionState,
} from "../../types/assignment-submission.types";
import { api } from "../../services/api";

// Initial state
const initialState: AssignmentSubmissionState = {
  submissions: [],
  userSubmissions: [],
  assignmentSubmissions: [],
  currentSubmission: null,
  status: "idle",
  error: null,
};

// Async actions
export const fetchAllSubmissions = createAsyncThunk(
  "assignmentSubmissions/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/assignment-submissions");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể lấy danh sách bài nộp"
      );
    }
  }
);

export const fetchSubmissionsByAssignment = createAsyncThunk(
  "assignmentSubmissions/fetchByAssignment",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/assignment-submissions/assignment/${id}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Không thể lấy danh sách bài nộp cho bài tập này"
      );
    }
  }
);

export const fetchUserSubmissions = createAsyncThunk(
  "assignmentSubmissions/fetchUserSubmissions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/assignment-submissions/user");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Không thể lấy danh sách bài nộp của bạn"
      );
    }
  }
);

export const fetchSubmissionById = createAsyncThunk(
  "assignmentSubmissions/fetchById",
  async (submissionId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/assignment-submissions/${submissionId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tìm thấy bài nộp"
      );
    }
  }
);

export const createSubmission = createAsyncThunk(
  "assignmentSubmissions/create",
  async (data: CreateSubmissionData, { rejectWithValue }) => {
    try {
      const response = await api.post("/assignment-submissions", data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tạo bài nộp"
      );
    }
  }
);

export const updateSubmission = createAsyncThunk(
  "assignmentSubmissions/update",
  async (
    {
      submissionId,
      data,
    }: { submissionId: number; data: UpdateSubmissionData },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(
        `/assignment-submissions/${submissionId}`,
        data
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể cập nhật bài nộp"
      );
    }
  }
);

export const gradeSubmission = createAsyncThunk(
  "assignmentSubmissions/grade",
  async (
    { submissionId, data }: { submissionId: number; data: GradeSubmissionData },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(
        `/assignment-submissions/${submissionId}/grade`,
        data
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể chấm điểm bài nộp"
      );
    }
  }
);

export const deleteSubmission = createAsyncThunk(
  "assignmentSubmissions/delete",
  async (submissionId: number, { rejectWithValue }) => {
    try {
      await api.delete(`/assignment-submissions/${submissionId}`);
      return submissionId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể xóa bài nộp"
      );
    }
  }
);

// Slice
const assignmentSubmissionsSlice = createSlice({
  name: "assignmentSubmissions",
  initialState,
  reducers: {
    resetSubmissionsState: (state) => {
      state.status = "idle";
      state.error = null;
    },
    clearCurrentSubmission: (state) => {
      state.currentSubmission = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all submissions
      .addCase(fetchAllSubmissions.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAllSubmissions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.submissions = action.payload;
        state.error = null;
      })
      .addCase(fetchAllSubmissions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch submissions by assignment
      .addCase(fetchSubmissionsByAssignment.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSubmissionsByAssignment.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.assignmentSubmissions = action.payload;
        state.error = null;
      })
      .addCase(fetchSubmissionsByAssignment.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch user submissions
      .addCase(fetchUserSubmissions.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUserSubmissions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.userSubmissions = action.payload;
        state.error = null;
      })
      .addCase(fetchUserSubmissions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch submission by ID
      .addCase(fetchSubmissionById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSubmissionById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentSubmission = action.payload;
        state.error = null;
      })
      .addCase(fetchSubmissionById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Create submission
      .addCase(createSubmission.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createSubmission.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.submissions.push(action.payload);
        state.userSubmissions.push(action.payload);
        state.currentSubmission = action.payload;
        state.error = null;
      })
      .addCase(createSubmission.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Update submission
      .addCase(updateSubmission.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateSubmission.fulfilled, (state, action) => {
        state.status = "succeeded";
        const updatedSubmission = action.payload;

        // Cập nhật trong danh sách
        state.submissions = state.submissions.map((submission) =>
          submission.id === updatedSubmission.id
            ? updatedSubmission
            : submission
        );

        state.userSubmissions = state.userSubmissions.map((submission) =>
          submission.id === updatedSubmission.id
            ? updatedSubmission
            : submission
        );

        state.assignmentSubmissions = state.assignmentSubmissions.map(
          (submission) =>
            submission.id === updatedSubmission.id
              ? updatedSubmission
              : submission
        );

        state.currentSubmission = updatedSubmission;
        state.error = null;
      })
      .addCase(updateSubmission.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Grade submission
      .addCase(gradeSubmission.pending, (state) => {
        state.status = "loading";
      })
      .addCase(gradeSubmission.fulfilled, (state, action) => {
        state.status = "succeeded";
        const gradedSubmission = action.payload;

        // Cập nhật trong danh sách
        state.submissions = state.submissions.map((submission) =>
          submission.id === gradedSubmission.id ? gradedSubmission : submission
        );

        state.assignmentSubmissions = state.assignmentSubmissions.map(
          (submission) =>
            submission.id === gradedSubmission.id
              ? gradedSubmission
              : submission
        );

        state.currentSubmission = gradedSubmission;
        state.error = null;
      })
      .addCase(gradeSubmission.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Delete submission
      .addCase(deleteSubmission.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteSubmission.fulfilled, (state, action) => {
        state.status = "succeeded";
        const submissionId = action.payload as number;

        // Xóa khỏi danh sách
        state.submissions = state.submissions.filter(
          (submission) => submission.id !== submissionId
        );

        state.userSubmissions = state.userSubmissions.filter(
          (submission) => submission.id !== submissionId
        );

        state.assignmentSubmissions = state.assignmentSubmissions.filter(
          (submission) => submission.id !== submissionId
        );

        if (state.currentSubmission?.id === submissionId) {
          state.currentSubmission = null;
        }

        state.error = null;
      })
      .addCase(deleteSubmission.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { resetSubmissionsState, clearCurrentSubmission } =
  assignmentSubmissionsSlice.actions;

export default assignmentSubmissionsSlice.reducer;
