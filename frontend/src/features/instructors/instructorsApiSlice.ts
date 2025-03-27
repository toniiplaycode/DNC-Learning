import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../services/api";

export interface Instructor {
  id: number;
  userId: number;
  fullName: string;
  professionalTitle?: string;
  specialization?: string;
  educationBackground?: string;
  teachingExperience?: string;
  bio?: string;
  expertiseAreas?: string;
  certificates?: string;
  linkedinProfile?: string;
  website?: string;
  paymentInfo?: any;
  verificationStatus: "pending" | "verified" | "rejected";
  verificationDocuments?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    username: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
  };
  // Thống kê
  averageRating?: string;
  totalReviews?: number;
  totalCourses?: number;
  totalStudents?: number;
  courses?: any[];
}

// Lấy danh sách tất cả giảng viên
export const fetchInstructors = createAsyncThunk(
  "instructors/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/user-instructors");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Không thể lấy danh sách giảng viên"
      );
    }
  }
);

// Lấy thông tin giảng viên theo ID
export const fetchInstructorById = createAsyncThunk(
  "instructors/fetchById",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/user-instructors/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Không thể lấy thông tin giảng viên"
      );
    }
  }
);

// Tạo giảng viên mới
export const createInstructor = createAsyncThunk(
  "instructors/create",
  async (
    instructorData: Omit<Instructor, "id" | "createdAt" | "updatedAt">,
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("/user-instructors", instructorData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Không thể tạo giảng viên"
      );
    }
  }
);

// Cập nhật thông tin giảng viên
export const updateInstructor = createAsyncThunk(
  "instructors/update",
  async (
    { id, instructorData }: { id: number; instructorData: Partial<Instructor> },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(
        `/user-instructors/${id}`,
        instructorData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Không thể cập nhật thông tin giảng viên"
      );
    }
  }
);

// Xác minh giảng viên
export const verifyInstructor = createAsyncThunk(
  "instructors/verify",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/user-instructors/${id}/verify`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Không thể xác minh giảng viên"
      );
    }
  }
);

// Từ chối giảng viên
export const rejectInstructor = createAsyncThunk(
  "instructors/reject",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/user-instructors/${id}/reject`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Không thể từ chối giảng viên"
      );
    }
  }
);

// Xóa giảng viên
export const deleteInstructor = createAsyncThunk(
  "instructors/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/user-instructors/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Không thể xóa giảng viên"
      );
    }
  }
);
