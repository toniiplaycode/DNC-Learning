import { UserStudent } from "../../../backend/src/entities/UserStudent";
import { Course } from "../../../backend/src/entities/Course";

export enum ReviewType {
  INSTRUCTOR = "instructor",
  COURSE = "course",
}

export enum ReviewStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export interface Review {
  id: number;
  userStudentId: number;
  reviewType: ReviewType;
  courseId: number;
  rating: number;
  reviewText: string;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
  student?: Partial<UserStudent>;
  course?: Partial<Course>;
}

export interface ReviewState {
  reviews: Review[];
  courseReviews: Review[];
  userReviews: Review[];
  instructorReviews: Review[]; // Add this line
  currentReview: Review | null;
  stats: ReviewStats | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

export interface CreateReviewData {
  userStudentId: number;
  reviewType: ReviewType;
  courseId: number;
  rating: number;
  reviewText: string;
}

export interface UpdateReviewData {
  rating?: number;
  reviewText?: string;
  status?: ReviewStatus;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratings: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}
