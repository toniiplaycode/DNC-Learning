import { RootState } from "../../app/store";
import { createSelector } from "@reduxjs/toolkit";
import { Review, ReviewStatus, ReviewType } from "../../types/review.types";

// Base selectors
export const selectReviewsState = (state: RootState) => state.reviews;
export const selectAllReviews = (state: RootState) => state.reviews.reviews;
export const selectCourseReviews = (state: RootState) =>
  state.reviews.courseReviews;
export const selectUserReviews = (state: RootState) =>
  state.reviews.userReviews;
export const selectCurrentReview = (state: RootState) =>
  state.reviews.currentReview;
export const selectReviewStats = (state: RootState) => state.reviews.stats;
export const selectReviewsStatus = (state: RootState) => state.reviews.status;
export const selectReviewsError = (state: RootState) => state.reviews.error;

export const selectInstructorReviews = (state: RootState) =>
  state.reviews.instructorReviews;

// Derived selectors
export const selectReviewById = (id: number) =>
  createSelector(
    [selectAllReviews],
    (reviews) => reviews.find((review) => review.id === id) || null
  );

export const selectAverageRating = createSelector(
  [selectCourseReviews],
  (reviews) => {
    if (reviews.length === 0) return 0;

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return Number((totalRating / reviews.length).toFixed(1));
  }
);

export const selectApprovedReviews = createSelector(
  [selectCourseReviews],
  (reviews) =>
    reviews.filter((review) => review.status === ReviewStatus.APPROVED)
);

export const selectRatingCounts = createSelector(
  [selectApprovedReviews],
  (reviews) => {
    const counts = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      total: reviews.length,
    };

    reviews.forEach((review) => {
      if (review.rating >= 1 && review.rating <= 5) {
        counts[review.rating as 1 | 2 | 3 | 4 | 5]++;
      }
    });

    return counts;
  }
);

export const selectReviewsByRating = (rating: number) =>
  createSelector([selectApprovedReviews], (reviews) =>
    reviews.filter((review) => Math.round(review.rating) === rating)
  );

export const selectReviewsByType = (type: ReviewType) =>
  createSelector([selectCourseReviews], (reviews) =>
    reviews.filter((review) => review.reviewType === type)
  );

export const selectReviewsByStatus = (status: ReviewStatus) =>
  createSelector([selectCourseReviews], (reviews) =>
    reviews.filter((review) => review.status === status)
  );

export const selectRecentReviews = (limit: number = 5) =>
  createSelector([selectApprovedReviews], (reviews) => {
    return [...reviews]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, limit);
  });

export const selectRatingPercentages = createSelector(
  [selectRatingCounts],
  (counts) => {
    const percentages = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    if (counts.total > 0) {
      percentages[1] = Math.round((counts[1] / counts.total) * 100);
      percentages[2] = Math.round((counts[2] / counts.total) * 100);
      percentages[3] = Math.round((counts[3] / counts.total) * 100);
      percentages[4] = Math.round((counts[4] / counts.total) * 100);
      percentages[5] = Math.round((counts[5] / counts.total) * 100);
    }

    return percentages;
  }
);

// Kiểm tra xem học viên đã đánh giá khóa học chưa
export const selectStudentReviewForCourse = (
  studentId: number,
  courseId: number
) =>
  createSelector(
    [selectAllReviews],
    (reviews) =>
      reviews.find(
        (review) =>
          review.userStudentId === studentId && review.courseId === courseId
      ) || null
  );
