import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../services/api";

export interface CourseLesson {
  id: number;
  title: string;
  contentType: string;
  contentUrl?: string;
  orderNumber: number;
  sectionId: number;
  createdAt?: string;
  updatedAt?: string;
}

// Fetch all course lessons
export const fetchCourseLessons = createAsyncThunk(
  "courseLessons/fetchCourseLessons",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/course-lessons");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Không thể tải danh sách bài học"
      );
    }
  }
);

// Fetch a course lesson by ID
export const fetchCourseLessonById = createAsyncThunk(
  "courseLessons/fetchCourseLessonById",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/course-lessons/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Không thể tải thông tin bài học"
      );
    }
  }
);

// Create a new course lesson
export const createCourseLesson = createAsyncThunk(
  "courseLessons/createCourseLesson",
  async (courseLessonData: Partial<CourseLesson>, { rejectWithValue }) => {
    try {
      const response = await api.post("/course-lessons", courseLessonData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Không thể tạo bài học mới"
      );
    }
  }
);

// Update an existing course lesson
export const updateCourseLesson = createAsyncThunk(
  "courseLessons/updateCourseLesson",
  async (courseLessonData: Partial<CourseLesson>, { rejectWithValue }) => {
    try {
      const { id, ...updateFields } = courseLessonData;

      if (!id) {
        return rejectWithValue("ID is required for updating a course lesson");
      }

      const updateData = {
        id: Number(id),
        ...updateFields,
        sectionId: Number(updateFields.sectionId),
        orderNumber: Number(updateFields.orderNumber),
      };

      const response = await api.patch(`/course-lessons/${id}`, updateData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Không thể cập nhật bài học"
      );
    }
  }
);

// Delete a course lesson
export const deleteCourseLesson = createAsyncThunk(
  "courseLessons/deleteCourseLesson",
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/course-lessons/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Không thể xóa bài học");
    }
  }
);
