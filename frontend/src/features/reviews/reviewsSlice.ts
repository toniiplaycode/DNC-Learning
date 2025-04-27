import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  ReviewState,
  CreateReviewData,
  UpdateReviewData,
} from "../../types/review.types";
import { api } from "../../services/api";

// Async thunks
export const fetchAllReviews = createAsyncThunk(
  "reviews/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/reviews");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải đánh giá"
      );
    }
  }
);

export const fetchReviewsByCourse = createAsyncThunk(
  "reviews/fetchByCourse",
  async (courseId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reviews/course/${courseId}`);
      console.log("response.data", response.data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Không thể tải đánh giá cho khóa học này"
      );
    }
  }
);

export const fetchReviewsByUser = createAsyncThunk(
  "reviews/fetchByStudent",
  async (studentId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reviews/student/${studentId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Không thể tải đánh giá của học viên này"
      );
    }
  }
);

export const fetchReviewById = createAsyncThunk(
  "reviews/fetchById",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reviews/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải chi tiết đánh giá"
      );
    }
  }
);

export const fetchCourseReviewStats = createAsyncThunk(
  "reviews/fetchCourseStats",
  async (courseId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reviews/course/${courseId}/stats`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Không thể tải thống kê đánh giá cho khóa học này"
      );
    }
  }
);

export const createReview = createAsyncThunk(
  "reviews/create",
  async (reviewData: CreateReviewData, { rejectWithValue }) => {
    try {
      const response = await api.post("/reviews", reviewData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tạo đánh giá"
      );
    }
  }
);

export const updateReview = createAsyncThunk(
  "reviews/update",
  async (
    { id, updateData }: { id: number; updateData: UpdateReviewData },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(`/reviews/${id}`, updateData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể cập nhật đánh giá"
      );
    }
  }
);

export const deleteReview = createAsyncThunk(
  "reviews/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/reviews/${id}`);
      return id; // Trả về ID để xóa khỏi state
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể xóa đánh giá"
      );
    }
  }
);

// Add new thunk for instructor reviews
export const fetchReviewsByInstructor = createAsyncThunk(
  "reviews/fetchByInstructor",
  async (instructorId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reviews/instructor/${instructorId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Không thể tải đánh giá của giảng viên này"
      );
    }
  }
);

// Initial state
const initialState: ReviewState = {
  reviews: [],
  courseReviews: [],
  userReviews: [],
  currentReview: null,
  stats: null,
  instructorReviews: [], // Add this line
  status: "idle",
  error: null,
};

// Slice
const reviewsSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {
    resetReviewsState: (state) => {
      state.reviews = [];
      state.courseReviews = [];
      state.userReviews = [];
      state.currentReview = null;
      state.stats = null;
      state.status = "idle";
      state.error = null;
    },
    clearReviewsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all reviews
      .addCase(fetchAllReviews.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAllReviews.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.reviews = action.payload;
        state.error = null;
      })
      .addCase(fetchAllReviews.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch reviews by course
      .addCase(fetchReviewsByCourse.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchReviewsByCourse.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.courseReviews = action.payload;
        state.error = null;
      })
      .addCase(fetchReviewsByCourse.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch reviews by user
      .addCase(fetchReviewsByUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchReviewsByUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.userReviews = action.payload;
        state.error = null;
      })
      .addCase(fetchReviewsByUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch course stats
      .addCase(fetchCourseReviewStats.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCourseReviewStats.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(fetchCourseReviewStats.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch review by id
      .addCase(fetchReviewById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchReviewById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentReview = action.payload;
        state.error = null;
      })
      .addCase(fetchReviewById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Create review
      .addCase(createReview.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.status = "succeeded";
        const newReview = action.payload;

        // Thêm vào các mảng tương ứng
        state.reviews.push(newReview);

        if (
          state.courseReviews.length > 0 &&
          state.courseReviews[0].courseId === newReview.courseId
        ) {
          state.courseReviews.push(newReview);
        }

        if (
          state.userReviews.length > 0 &&
          state.userReviews[0].userStudentId === newReview.userStudentId
        ) {
          state.userReviews.push(newReview);
        }

        state.error = null;
      })
      .addCase(createReview.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Update review
      .addCase(updateReview.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.status = "succeeded";
        const updatedReview = action.payload;

        // Cập nhật trong tất cả các mảng
        state.reviews = state.reviews.map((review) =>
          review.id === updatedReview.id ? updatedReview : review
        );

        state.courseReviews = state.courseReviews.map((review) =>
          review.id === updatedReview.id ? updatedReview : review
        );

        state.userReviews = state.userReviews.map((review) =>
          review.id === updatedReview.id ? updatedReview : review
        );

        if (state.currentReview?.id === updatedReview.id) {
          state.currentReview = updatedReview;
        }

        state.error = null;
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Delete review
      .addCase(deleteReview.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.status = "succeeded";
        const id = action.payload;

        // Xóa review khỏi tất cả các mảng
        state.reviews = state.reviews.filter((review) => review.id !== id);
        state.courseReviews = state.courseReviews.filter(
          (review) => review.id !== id
        );
        state.userReviews = state.userReviews.filter(
          (review) => review.id !== id
        );

        if (state.currentReview?.id === id) {
          state.currentReview = null;
        }

        state.error = null;
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Add cases for instructor reviews
      .addCase(fetchReviewsByInstructor.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchReviewsByInstructor.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.instructorReviews = action.payload;
        state.error = null;
      })
      .addCase(fetchReviewsByInstructor.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { resetReviewsState, clearReviewsError } = reviewsSlice.actions;

export default reviewsSlice.reducer;
