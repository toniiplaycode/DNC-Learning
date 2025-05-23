import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  QuizzesState,
  QuizType,
  CreateQuizData,
  UpdateQuizData,
  CreateQuestionData,
  SubmitQuizData,
  AttemptStatus,
} from "../../types/quiz.types";
import { api } from "../../services/api";
import { toast } from "react-toastify";

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
        error.response?.data?.message || "Không thể tải Bài trắc nghiệm"
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
        error.response?.data?.message || "Không thể tải Bài trắc nghiệm"
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
        error.response?.data?.message || "Không thể tải Bài trắc nghiệm"
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
          "Không thể tải Bài trắc nghiệm cho sinh viên học thuật"
      );
    }
  }
);

export const fetchQuizzesByCourse = createAsyncThunk(
  "quizzes/fetchByCourse",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/quizzes/courses/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Không thể tải Bài trắc nghiệm cho sinh viên học thuật"
      );
    }
  }
);

export const createQuiz = createAsyncThunk(
  "quizzes/create",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await api.post("/quizzes", data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tạo Bài trắc nghiệm"
      );
    }
  }
);

export const updateQuiz = createAsyncThunk(
  "quizzes/update",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/quizzes/${Number(data.id)}`, data);
      console.log("response", response);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể cập nhật bài trắc nghiệm"
      );
    }
  }
);

export const deleteQuiz = createAsyncThunk(
  "quizzes/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/quizzes/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể xóa Bài trắc nghiệm"
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
      console.log(quizId);
      const response = await api.post("/quizzes/attempts", { quizId });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể bắt đầu Bài trắc nghiệm"
      );
    }
  }
);

export const fetchAttemptByUserIdAndQuizId = createAsyncThunk(
  "quizzes/fetchAttemptByUserIdAndQuizId",
  async (
    { userId, quizId }: { userId: number; quizId: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get(
        `/quizzes/attempts/user/${userId}/quiz/${quizId}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải lần thử Bài trắc nghiệm"
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
          "Không thể tải lịch sử làm Bài trắc nghiệm"
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

export const submitQuizResponsesAndUpdateAttempt = createAsyncThunk(
  "quizzes/submit",
  async (data: SubmitQuizData, { rejectWithValue }) => {
    try {
      const response = await api.post("/quizzes/submit", data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể nộp Bài trắc nghiệm"
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
        error.response?.data?.message || "Không thể tải kết quả Bài trắc nghiệm"
      );
    }
  }
);

// Add new thunk after other thunks
export const fetchQuizzesByInstructor = createAsyncThunk(
  "quizzes/fetchByInstructor",
  async (instructorId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/quizzes/instructor/${instructorId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Không thể tải danh sách bài trắc nghiệm"
      );
    }
  }
);

export const fetchInstructorAttempts = createAsyncThunk(
  "quizzes/fetchInstructorAttempts",
  async (instructorId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/quizzes/attempts/instructor/${instructorId}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Không thể tải danh sách bài làm của học viên"
      );
    }
  }
);

// Add new thunk for fetching attempts by quiz ID
export const fetchAttemptsByQuizId = createAsyncThunk(
  "quizzes/fetchAttemptsByQuizId",
  async (quizId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/quizzes/attempts/quiz/${quizId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Không thể tải danh sách bài làm của bài trắc nghiệm"
      );
    }
  }
);

// Thêm thunk mới sau các thunk khác
export const updateShowExplanation = createAsyncThunk(
  "quizzes/updateShowExplanation",
  async (
    { quizId, showExplanation }: { quizId: number; showExplanation: number },
    { rejectWithValue }
  ) => {
    try {
      console.log(quizId, showExplanation);
      const response = await api.patch(`/quizzes/show-explanation/${quizId}`, {
        showExplanation,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Không thể cập nhật trạng thái hiển thị giải thích"
      );
    }
  }
);

// Add new thunk for generating quiz from file
export const generateQuizFromFile = createAsyncThunk(
  "quizzes/generateFromFile",
  async (
    {
      file,
      numQuestions,
    }: {
      file: File;
      numQuestions: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("numQuestions", numQuestions.toString());

      const response = await api.post("/quizzes/generate-from-file", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tạo bài trắc nghiệm từ file"
      );
    }
  }
);

// Add to interface QuizzesState
interface QuizzesState {
  quizzes: any[];
  lessonQuizzes: any[];
  currentQuiz: any;
  userAttempts: any[];
  currentAttempt: any;
  quizResult: any;
  status: "idle" | "loading" | "succeeded" | "failed";
  statusUpdateQuiz: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  instructorQuizzes: any[];
  instructorQuizzesStatus: "idle" | "loading" | "succeeded" | "failed";
  instructorAttempts: any[];
  instructorAttemptsStatus: "idle" | "loading" | "succeeded" | "failed";
  instructorAttemptsError: string | null;
  quizAttempts: any[];
  quizAttemptsStatus: "idle" | "loading" | "succeeded" | "failed";
  quizAttemptsError: string | null;
  showExplanationStatus: "idle" | "loading" | "succeeded" | "failed";
  showExplanationError: string | null;
  generatedQuiz: {
    questions: any[];
    sourceFile: string;
    generatedAt: string;
    maxQuestions: number;
    contentLength: number;
    actualQuestionsGenerated: number;
  } | null;
  generateQuizStatus: "idle" | "loading" | "succeeded" | "failed";
  generateQuizError: string | null;
}

// Update initial state
const initialState: QuizzesState = {
  quizzes: [],
  lessonQuizzes: [],
  currentQuiz: null,
  userAttempts: [],
  currentAttempt: null,
  quizResult: null,
  status: "idle",
  statusUpdateQuiz: "idle",
  error: null,
  instructorQuizzes: [],
  instructorQuizzesStatus: "idle",
  instructorAttempts: [],
  instructorAttemptsStatus: "idle",
  instructorAttemptsError: null,
  quizAttempts: [],
  quizAttemptsStatus: "idle",
  quizAttemptsError: null,
  showExplanationStatus: "idle",
  showExplanationError: null,
  generatedQuiz: null,
  generateQuizStatus: "idle",
  generateQuizError: null,
};

// Add to reducers
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
    resetInstructorAttempts: (state) => {
      state.instructorAttempts = [];
      state.instructorAttemptsStatus = "idle";
      state.instructorAttemptsError = null;
    },
    resetQuizAttempts: (state) => {
      state.quizAttempts = [];
      state.quizAttemptsStatus = "idle";
      state.quizAttemptsError = null;
    },
    resetShowExplanationStatus: (state) => {
      state.showExplanationStatus = "idle";
      state.showExplanationError = null;
    },
    resetGeneratedQuiz: (state) => {
      state.generatedQuiz = null;
      state.generateQuizStatus = "idle";
      state.generateQuizError = null;
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
        state.error = null;
      })
      .addCase(createQuiz.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Update quiz
      .addCase(updateQuiz.pending, (state) => {
        state.statusUpdateQuiz = "loading";
      })
      .addCase(updateQuiz.fulfilled, (state, action) => {
        state.statusUpdateQuiz = "succeeded";
      })
      .addCase(updateQuiz.rejected, (state, action) => {
        state.statusUpdateQuiz = "failed";
        state.error = action.payload as string;
      })

      // Delete quiz
      .addCase(deleteQuiz.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteQuiz.fulfilled, (state, action) => {
        state.status = "succeeded";
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

      // Fetch attempt by user id and quiz id
      .addCase(fetchAttemptByUserIdAndQuizId.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAttemptByUserIdAndQuizId.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentAttempt = action.payload;
        state.error = null;
      })
      .addCase(fetchAttemptByUserIdAndQuizId.rejected, (state, action) => {
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

      // Submit quiz responses and update attempt
      .addCase(submitQuizResponsesAndUpdateAttempt.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        submitQuizResponsesAndUpdateAttempt.fulfilled,
        (state, action) => {
          state.status = "succeeded";

          // Update the current attempt with the submitted responses
          if (state.currentAttempt) {
            state.currentAttempt = {
              ...state.currentAttempt,
              status: AttemptStatus.COMPLETED,
              endTime: new Date().toISOString(),
            };
          }

          // Update the attempt in userAttempts array
          state.userAttempts = state.userAttempts.map((attempt) => {
            if (attempt.id === action.payload.attemptId) {
              return {
                ...attempt,
                status: AttemptStatus.COMPLETED,
                endTime: new Date().toISOString(),
              };
            }
            return attempt;
          });

          state.quizResult = action.payload;
          state.error = null;
        }
      )
      .addCase(
        submitQuizResponsesAndUpdateAttempt.rejected,
        (state, action) => {
          state.status = "failed";
          state.error = action.payload as string;
        }
      )

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
      })

      // Fetch quizzes by course
      .addCase(fetchQuizzesByCourse.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchQuizzesByCourse.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.quizzes = action.payload;
        state.error = null;
      })
      .addCase(fetchQuizzesByCourse.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch quizzes by instructor
      .addCase(fetchQuizzesByInstructor.pending, (state) => {
        state.instructorQuizzesStatus = "loading";
      })
      .addCase(fetchQuizzesByInstructor.fulfilled, (state, action) => {
        state.instructorQuizzesStatus = "succeeded";
        state.instructorQuizzes = action.payload;
        state.error = null;
      })
      .addCase(fetchQuizzesByInstructor.rejected, (state, action) => {
        state.instructorQuizzesStatus = "failed";
        state.error = action.payload as string;
      })

      // Fetch instructor attempts
      .addCase(fetchInstructorAttempts.pending, (state) => {
        state.instructorAttemptsStatus = "loading";
      })
      .addCase(fetchInstructorAttempts.fulfilled, (state, action) => {
        state.instructorAttemptsStatus = "succeeded";
        state.instructorAttempts = action.payload;
      })
      .addCase(fetchInstructorAttempts.rejected, (state, action) => {
        state.instructorAttemptsStatus = "failed";
        state.instructorAttemptsError = action.payload as string;
      })

      // Fetch attempts by quiz ID
      .addCase(fetchAttemptsByQuizId.pending, (state) => {
        state.quizAttemptsStatus = "loading";
      })
      .addCase(fetchAttemptsByQuizId.fulfilled, (state, action) => {
        state.quizAttemptsStatus = "succeeded";
        state.quizAttempts = action.payload;
        state.quizAttemptsError = null;
      })
      .addCase(fetchAttemptsByQuizId.rejected, (state, action) => {
        state.quizAttemptsStatus = "failed";
        state.quizAttemptsError = action.payload as string;
      })

      // Update show explanation
      .addCase(updateShowExplanation.pending, (state) => {
        state.showExplanationStatus = "loading";
        state.showExplanationError = null;
      })
      .addCase(updateShowExplanation.fulfilled, (state, action) => {
        state.showExplanationStatus = "succeeded";
        // Cập nhật showExplanation trong currentQuiz nếu đang xem quiz đó
        if (state.currentQuiz && state.currentQuiz.id === action.payload.id) {
          state.currentQuiz.showExplanation = action.payload.showExplanation;
        }
        // Cập nhật trong danh sách quizzes nếu có
        state.quizzes = state.quizzes.map((quiz) =>
          quiz.id === action.payload.id
            ? { ...quiz, showExplanation: action.payload.showExplanation }
            : quiz
        );
        // Cập nhật trong instructorQuizzes nếu có
        state.instructorQuizzes = state.instructorQuizzes.map((quiz) =>
          quiz.id === action.payload.id
            ? { ...quiz, showExplanation: action.payload.showExplanation }
            : quiz
        );

        toast.success("Cập nhật trạng thái hiển thị giải thích thành công");
      })
      .addCase(updateShowExplanation.rejected, (state, action) => {
        state.showExplanationStatus = "failed";
        state.showExplanationError = action.payload as string;
      })

      // Generate quiz from file
      .addCase(generateQuizFromFile.pending, (state) => {
        state.generateQuizStatus = "loading";
        state.generateQuizError = null;
      })
      .addCase(generateQuizFromFile.fulfilled, (state, action) => {
        state.generateQuizStatus = "succeeded";
        state.generatedQuiz = action.payload.questions.questions;
        state.error = null;
        toast.success("Tạo bài trắc nghiệm từ file thành công");
      })
      .addCase(generateQuizFromFile.rejected, (state, action) => {
        state.generateQuizStatus = "failed";
        state.generateQuizError = action.payload as string;
        toast.error(action.payload as string);
      });
  },
});

export const {
  resetQuizzesState,
  clearQuizError,
  clearCurrentQuiz,
  clearQuizResult,
  resetInstructorAttempts,
  resetQuizAttempts,
  resetShowExplanationStatus,
  resetGeneratedQuiz,
} = quizzesSlice.actions;

export default quizzesSlice.reducer;
