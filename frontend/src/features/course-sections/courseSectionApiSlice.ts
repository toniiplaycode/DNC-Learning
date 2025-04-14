import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../services/api";

export interface CourseSection {
  id: number;
  courseId: number;
  title: string;
  description?: string;
  orderNumber: number;
  createdAt?: string;
  updatedAt?: string;
}

// Fetch all course sections
export const fetchCourseSections = createAsyncThunk(
  "courseSections/fetchCourseSections",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/course-sections");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Không thể tải danh sách phần khóa học"
      );
    }
  }
);

// Fetch a single course section by id
export const fetchCourseSectionById = createAsyncThunk(
  "courseSections/fetchCourseSectionById",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/course-sections/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Không thể tải thông tin phần khóa học"
      );
    }
  }
);

// Fetch course sections by course id
export const fetchCourseSectionsByCourseId = createAsyncThunk(
  "courseSections/fetchCourseSectionsByCourseId",
  async (courseId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/course-sections/course/${courseId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data ||
          "Không thể tải danh sách phần khóa học theo khóa học"
      );
    }
  }
);

// Create a new course section
export const createCourseSection = createAsyncThunk(
  "courseSections/createCourseSection",
  async (courseSectionData: Partial<CourseSection>, { rejectWithValue }) => {
    try {
      const response = await api.post("/course-sections", courseSectionData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Không thể tạo phần khóa học mới"
      );
    }
  }
);

// Update an existing course section
export const updateCourseSection = createAsyncThunk(
  "courseSections/updateCourseSection",
  async (courseSectionData: Partial<CourseSection>, { rejectWithValue }) => {
    try {
      const { id, ...updateFields } = courseSectionData;

      if (!id) {
        return rejectWithValue("ID is required for updating a course section");
      }

      // Ensure all numeric fields are properly converted
      const updateData = {
        id: Number(id),
        ...updateFields,
        courseId: Number(updateFields.courseId),
        orderNumber: Number(updateFields.orderNumber),
      };

      // Log request data for debugging
      console.log("Update Request Data:", updateData);

      const response = await api.patch(`/course-sections/${id}`, updateData);
      return response.data;
    } catch (error: any) {
      console.error("Update Error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data ||
          "Không thể cập nhật phần khóa học"
      );
    }
  }
);

// Delete a course section
export const deleteCourseSection = createAsyncThunk(
  "courseSections/deleteCourseSection",
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/course-sections/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Không thể xóa phần khóa học"
      );
    }
  }
);
