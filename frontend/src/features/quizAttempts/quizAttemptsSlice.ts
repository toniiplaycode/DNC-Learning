import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../services/api";
import { QuizAttempt, QuizResponse } from "../../types/quiz-attempt.types";

// Initial state
interface QuizAttemptsState {
  attemptsUser: QuizAttempt[];
  currentAttempt: QuizAttempt | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: QuizAttemptsState = {
  attemptsUser: [],
  currentAttempt: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchUserAttempts = createAsyncThunk(
  "quizAttempts/fetchUserAttempts",
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/quizzes/attempts/user/${userId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải lần làm bài"
      );
    }
  }
);

export const fetchAttemptById = createAsyncThunk(
  "quizAttempts/fetchAttemptById",
  async (attemptId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/quizzes/attempts/${attemptId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải lần làm bài"
      );
    }
  }
);

export const startNewAttempt = createAsyncThunk(
  "quizAttempts/startNewAttempt",
  async (
    { userId, quizId }: { userId: number; quizId: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("/quizzes/attempts", { userId, quizId });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể bắt đầu bài làm mới"
      );
    }
  }
);

export const submitResponse = createAsyncThunk(
  "quizAttempts/submitResponse",
  async (
    {
      attemptId,
      questionId,
      selectedOptionId,
    }: {
      attemptId: number;
      questionId: number;
      selectedOptionId: number | null;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("/quizzes/responses", {
        attemptId,
        questionId,
        selectedOptionId,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể lưu câu trả lời"
      );
    }
  }
);

export const completeAttempt = createAsyncThunk(
  "quizAttempts/completeAttempt",
  async (attemptId: number, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        `/quizzes/attempts/${attemptId}/complete`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể hoàn thành bài làm"
      );
    }
  }
);

// Slice
const quizAttemptsSlice = createSlice({
  name: "quizAttempts",
  initialState,
  reducers: {
    clearCurrentAttempt: (state) => {
      state.currentAttempt = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchUserAttempts
      .addCase(fetchUserAttempts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchUserAttempts.fulfilled,
        (state, action: PayloadAction<QuizAttempt[]>) => {
          state.isLoading = false;
          state.attemptsUser = action.payload;
        }
      )
      .addCase(fetchUserAttempts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // fetchAttemptById
      .addCase(fetchAttemptById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchAttemptById.fulfilled,
        (state, action: PayloadAction<QuizAttempt>) => {
          state.isLoading = false;
          state.currentAttempt = action.payload;
        }
      )
      .addCase(fetchAttemptById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // startNewAttempt
      .addCase(startNewAttempt.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        startNewAttempt.fulfilled,
        (state, action: PayloadAction<QuizAttempt>) => {
          state.isLoading = false;
          state.currentAttempt = action.payload;
          state.attemptsUser = [action.payload, ...state.attemptsUser];
        }
      )
      .addCase(startNewAttempt.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // submitResponse
      .addCase(
        submitResponse.fulfilled,
        (state, action: PayloadAction<QuizResponse>) => {
          if (state.currentAttempt) {
            // Tìm và cập nhật phản hồi hiện tại hoặc thêm mới
            const existingResponseIndex =
              state.currentAttempt.responses.findIndex(
                (r) => r.questionId === action.payload.questionId
              );

            if (existingResponseIndex >= 0) {
              state.currentAttempt.responses[existingResponseIndex] =
                action.payload;
            } else {
              state.currentAttempt.responses.push(action.payload);
            }
          }
        }
      )
      // completeAttempt
      .addCase(
        completeAttempt.fulfilled,
        (state, action: PayloadAction<QuizAttempt>) => {
          state.currentAttempt = action.payload;
          // Cập nhật attempt trong danh sách attemptsUser
          const index = state.attemptsUser.findIndex(
            (a) => a.id === action.payload.id
          );
          if (index >= 0) {
            state.attemptsUser[index] = action.payload;
          }
        }
      );
  },
});

// Export actions
export const { clearCurrentAttempt } = quizAttemptsSlice.actions;

export default quizAttemptsSlice.reducer;
