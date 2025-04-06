import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  QuizzesState,
  QuizType,
  CreateQuizData,
  UpdateQuizData,
  CreateQuestionData,
  SubmitQuizData,
} from "../../types/quiz.types";
import { api } from "../../services/api";

// Async thunks
export const fetchQuizzes = createAsyncThunk(
  "quizzes/fetchAll",
  async (
    { lessonId, type }: { lessonId?: number; type?: QuizType },
    { rejectWithValue }
  ) => {
    try {
      let url = "/quizzes";
      const params: Record<string, string> = {};

      if (lessonId) params.lessonId = lessonId.toString();
      if (type) params.type = type;

      const response = await api.get(url, { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải bài kiểm tra"
      );
    }
  }
);

export const fetchQuizzesByLesson = createAsyncThunk(
  "quizzes/fetchByLesson",
  async (lessonId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/quizzes/lesson/${lessonId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải bài kiểm tra"
      );
    }
  }
);

export const fetchQuizById = createAsyncThunk(
  "quizzes/fetchById",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/quizzes/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải bài kiểm tra"
      );
    }
  }
);

export const fetchQuizzesByStudentAcademic = createAsyncThunk(
  "quizzes/fetchByStudentAcademic",
  async (studentAcademicId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/quizzes/student-academic/${studentAcademicId}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Không thể tải bài kiểm tra cho sinh viên học thuật"
      );
    }
  }
);

export const createQuiz = createAsyncThunk(
  "quizzes/create",
  async (data: CreateQuizData, { rejectWithValue }) => {
    try {
      const response = await api.post("/quizzes", data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tạo bài kiểm tra"
      );
    }
  }
);

export const updateQuiz = createAsyncThunk(
  "quizzes/update",
  async (
    { id, data }: { id: number; data: UpdateQuizData },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(`/quizzes/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể cập nhật bài kiểm tra"
      );
    }
  }
);

export const deleteQuiz = createAsyncThunk(
  "quizzes/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/quizzes/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể xóa bài kiểm tra"
      );
    }
  }
);

export const createQuestion = createAsyncThunk(
  "quizzes/createQuestion",
  async (data: CreateQuestionData, { rejectWithValue }) => {
    try {
      const response = await api.post("/quizzes/questions", data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tạo câu hỏi"
      );
    }
  }
);

export const deleteQuestion = createAsyncThunk(
  "quizzes/deleteQuestion",
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/quizzes/questions/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể xóa câu hỏi"
      );
    }
  }
);

export const createAttempt = createAsyncThunk(
  "quizzes/createAttempt",
  async (quizId: number, { rejectWithValue }) => {
    try {
      const response = await api.post("/quizzes/attempts", { quizId });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể bắt đầu bài kiểm tra"
      );
    }
  }
);

export const fetchUserAttempts = createAsyncThunk(
  "quizzes/fetchUserAttempts",
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/quizzes/attempts/user/${userId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Không thể tải lịch sử làm bài kiểm tra"
      );
    }
  }
);

export const fetchAttempt = createAsyncThunk(
  "quizzes/fetchAttempt",
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

export const submitQuiz = createAsyncThunk(
  "quizzes/submit",
  async (data: SubmitQuizData, { rejectWithValue }) => {
    try {
      const response = await api.post("/quizzes/submit", data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể nộp bài kiểm tra"
      );
    }
  }
);

export const fetchQuizResults = createAsyncThunk(
  "quizzes/fetchResults",
  async (attemptId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/quizzes/results/${attemptId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải kết quả bài kiểm tra"
      );
    }
  }
);

// Initial state
const initialState: QuizzesState = {
  quizzes: [],
  lessonQuizzes: [],
  currentQuiz: null,
  userAttempts: [],
  currentAttempt: null,
  quizResult: null,
  status: "idle",
  error: null,
};

// Slice
const quizzesSlice = createSlice({
  name: "quizzes",
  initialState,
  reducers: {
    resetQuizzesState: (state) => {
      return initialState;
    },
    clearQuizError: (state) => {
      state.error = null;
    },
    clearCurrentQuiz: (state) => {
      state.currentQuiz = null;
    },
    clearQuizResult: (state) => {
      state.quizResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all quizzes
      .addCase(fetchQuizzes.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchQuizzes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.quizzes = action.payload;
        state.error = null;
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch quizzes by lesson
      .addCase(fetchQuizzesByLesson.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchQuizzesByLesson.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.lessonQuizzes = action.payload;
        state.error = null;
      })
      .addCase(fetchQuizzesByLesson.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch quiz by id
      .addCase(fetchQuizById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchQuizById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentQuiz = action.payload;
        state.error = null;
      })
      .addCase(fetchQuizById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Create quiz
      .addCase(createQuiz.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createQuiz.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.quizzes.unshift(action.payload);
        state.currentQuiz = action.payload;
        state.error = null;
      })
      .addCase(createQuiz.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Update quiz
      .addCase(updateQuiz.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateQuiz.fulfilled, (state, action) => {
        state.status = "succeeded";
        const updatedQuiz = action.payload;

        state.quizzes = state.quizzes.map((quiz) =>
          quiz.id === updatedQuiz.id ? updatedQuiz : quiz
        );

        state.lessonQuizzes = state.lessonQuizzes.map((quiz) =>
          quiz.id === updatedQuiz.id ? updatedQuiz : quiz
        );

        if (state.currentQuiz?.id === updatedQuiz.id) {
          state.currentQuiz = updatedQuiz;
        }

        state.error = null;
      })
      .addCase(updateQuiz.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Delete quiz
      .addCase(deleteQuiz.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteQuiz.fulfilled, (state, action) => {
        state.status = "succeeded";
        const id = action.payload as number;

        state.quizzes = state.quizzes.filter((quiz) => quiz.id !== id);
        state.lessonQuizzes = state.lessonQuizzes.filter(
          (quiz) => quiz.id !== id
        );

        if (state.currentQuiz?.id === id) {
          state.currentQuiz = null;
        }

        state.error = null;
      })
      .addCase(deleteQuiz.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Create question
      .addCase(createQuestion.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createQuestion.fulfilled, (state, action) => {
        state.status = "succeeded";
        const newQuestion = action.payload;

        if (state.currentQuiz && state.currentQuiz.id === newQuestion.quizId) {
          if (!state.currentQuiz.questions) {
            state.currentQuiz.questions = [];
          }
          state.currentQuiz.questions.push(newQuestion);
          // Re-sort by order number
          state.currentQuiz.questions.sort(
            (a, b) => a.orderNumber - b.orderNumber
          );
        }

        state.error = null;
      })
      .addCase(createQuestion.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Delete question
      .addCase(deleteQuestion.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        state.status = "succeeded";
        const questionId = action.payload as number;

        if (state.currentQuiz && state.currentQuiz.questions) {
          state.currentQuiz.questions = state.currentQuiz.questions.filter(
            (q) => q.id !== questionId
          );
        }

        state.error = null;
      })
      .addCase(deleteQuestion.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Create attempt
      .addCase(createAttempt.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createAttempt.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentAttempt = action.payload;
        state.userAttempts.unshift(action.payload);
        state.error = null;
      })
      .addCase(createAttempt.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch user attempts
      .addCase(fetchUserAttempts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUserAttempts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.userAttempts = action.payload;
        state.error = null;
      })
      .addCase(fetchUserAttempts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch attempt
      .addCase(fetchAttempt.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAttempt.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentAttempt = action.payload;
        state.error = null;
      })
      .addCase(fetchAttempt.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Submit quiz
      .addCase(submitQuiz.pending, (state) => {
        state.status = "loading";
      })
      .addCase(submitQuiz.fulfilled, (state, action) => {
        state.status = "succeeded";

        // Update the current attempt with the submitted responses
        if (state.currentAttempt) {
          state.currentAttempt = {
            ...state.currentAttempt,
            status: "completed",
            endTime: new Date().toISOString(),
          };
        }

        // Update the attempt in userAttempts array
        state.userAttempts = state.userAttempts.map((attempt) => {
          if (attempt.id === action.payload.attemptId) {
            return {
              ...attempt,
              status: "completed",
              endTime: new Date().toISOString(),
            };
          }
          return attempt;
        });

        state.quizResult = action.payload;
        state.error = null;
      })
      .addCase(submitQuiz.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch quiz results
      .addCase(fetchQuizResults.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchQuizResults.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.quizResult = action.payload;
        state.error = null;
      })
      .addCase(fetchQuizResults.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch quizzes by student academic
      .addCase(fetchQuizzesByStudentAcademic.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchQuizzesByStudentAcademic.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.quizzes = action.payload;
        state.error = null;
      })
      .addCase(fetchQuizzesByStudentAcademic.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const {
  resetQuizzesState,
  clearQuizError,
  clearCurrentQuiz,
  clearQuizResult,
} = quizzesSlice.actions;

export default quizzesSlice.reducer;
