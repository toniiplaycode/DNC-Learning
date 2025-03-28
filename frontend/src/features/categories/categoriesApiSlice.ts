import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../services/api";

export interface Category {
  id: number;
  name: string;
  description?: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
  courseCount?: number;
}

// Fetch tất cả categories
export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/categories");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Không thể lấy danh sách danh mục"
      );
    }
  }
);

// Fetch một category theo ID
export const fetchCategoryById = createAsyncThunk(
  "categories/fetchCategoryById",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/categories/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Không thể lấy thông tin danh mục"
      );
    }
  }
);

// Tạo category mới
export const createCategory = createAsyncThunk(
  "categories/createCategory",
  async (categoryData: Partial<Category>, { rejectWithValue }) => {
    try {
      const response = await api.post("/categories", categoryData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Không thể tạo danh mục");
    }
  }
);

// Cập nhật một category
export const updateCategory = createAsyncThunk(
  "categories/updateCategory",
  async (
    { id, categoryData }: { id: number; categoryData: Partial<Category> },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(`/categories/${id}`, categoryData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Không thể cập nhật danh mục"
      );
    }
  }
);

// Xóa một category
export const deleteCategory = createAsyncThunk(
  "categories/deleteCategory",
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/categories/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Không thể xóa danh mục");
    }
  }
);
