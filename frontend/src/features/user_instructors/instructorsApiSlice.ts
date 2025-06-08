import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../services/api";
import { VerificationStatus } from "../../types/user-instructor.types";

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
  facultyId?: number;
  faculty?: {
    id: number;
    facultyName: string;
  };
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

export interface CreateInstructorRequest {
  user: {
    username: string;
    email: string;
    password: string;
    phone?: string;
    avatarUrl?: string;
  };
  instructor: {
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
    verificationDocuments?: string;
    verificationStatus?: VerificationStatus;
    facultyId?: number | null;
  };
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
  async (data: CreateInstructorRequest, { rejectWithValue }) => {
    try {
      const response = await api.post("/users/instructor", data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tạo giảng viên"
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
  async (userId: number, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/users/instructor/${userId}`);
      // Sau khi xóa thành công, fetch lại danh sách
      await dispatch(fetchInstructors());
      return userId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể xóa giảng viên"
      );
    }
  }
);
