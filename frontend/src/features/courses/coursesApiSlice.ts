import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../services/api";

export interface Course {
  id: number;
  title: string;
  slug: string;
  description?: string;
  categoryId?: number;
  instructorId?: number;
  price: number;
  duration?: number;
  level?: "beginner" | "intermediate" | "advanced";
  status: "draft" | "published" | "archived";
  thumbnailUrl?: string;
  startDate?: string;
  endDate?: string;
  enrollmentLimit?: number;
  createdAt: string;
  updatedAt: string;
  for?: "student" | "student_academic" | "both";
  category?: {
    id: number;
    name: string;
    description?: string;
  };
  instructor?: {
    id: number;
    username: string;
    email: string;
    avatarUrl?: string;
    role: string;
  };
  sections?: any[];
  documents?: any[];
}

// Fetch all courses
export const fetchCourses = createAsyncThunk(
  "courses/fetchCourses",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/courses");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Không thể tải danh sách khóa học"
      );
    }
  }
);

// Fetch a single course by id
export const fetchCourseById = createAsyncThunk(
  "courses/fetchCourseById",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/courses/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Không thể tải thông tin khóa học"
      );
    }
  }
);

export const fetchCoursesByInstructor = createAsyncThunk(
  "courses/fetchCoursesByInstructor",
  async (instructorId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/courses/instructor/${instructorId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Không thể tải danh sách khóa học"
      );
    }
  }
);

// Create a new course
export const createCourse = createAsyncThunk(
  "courses/createCourse",
  async (courseData: any, { rejectWithValue }) => {
    try {
      const response = await api.post("/courses", courseData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Không thể tạo khóa học mới"
      );
    }
  }
);

// Update an existing course
export const updateCourse = createAsyncThunk(
  "courses/updateCourse",
  async (
    { id, courseData }: { id: number; courseData: Partial<Course> },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(`/courses/${id}`, courseData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Không thể cập nhật khóa học"
      );
    }
  }
);

// Delete a course
export const deleteCourse = createAsyncThunk(
  "courses/deleteCourse",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/courses/${id}`);
      console.log(response);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Không thể xóa khóa học");
    }
  }
);
