import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../services/api";

export enum ForumStatus {
  ACTIVE = "active",
  ARCHIVED = "archived",
  CLOSED = "closed",
}

export interface ForumUser {
  id: number;
  username: string;
  avatarUrl?: string;
  role: string;
}

export interface ForumReply {
  id: number;
  forumId: number;
  userId: number;
  content: string;
  isSolution: boolean;
  createdAt: string;
  updatedAt: string;
  user?: ForumUser;
  likeCount?: number;
  isLiked?: boolean;
}

export interface Forum {
  id: number;
  courseId: number;
  userId: number;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  status: ForumStatus;
  createdAt: string;
  updatedAt: string;
  user?: ForumUser;
  course?: {
    id: number;
    title: string;
  };
  replies?: ForumReply[];
  likes?: any[];
  replyCount?: number;
  likeCount?: number;
  isSolved?: boolean;
  isLiked?: boolean;
}

export interface UserLikeForum {
  id: number;
  username: string;
  email: string;
}

// Fetch forums
export const fetchForums = createAsyncThunk(
  "forums/fetchForums",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/forums");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Không thể lấy danh sách diễn đàn"
      );
    }
  }
);

// Fetch forum by ID
export const fetchForumById = createAsyncThunk(
  "forums/fetchForumById",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/forums/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Không thể lấy thông tin diễn đàn"
      );
    }
  }
);

export const fetchForumsByUserId = createAsyncThunk(
  "forums/fetchByUserId",
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/forums/user/${userId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user's forums"
      );
    }
  }
);

// Create forum
export const createForum = createAsyncThunk(
  "forums/createForum",
  async (forumData: any, { rejectWithValue }) => {
    try {
      const response = await api.post("/forums", forumData);
      console.log("response", response.data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Không thể tạo diễn đàn");
    }
  }
);

// Update forum
export const updateForum = createAsyncThunk(
  "forums/updateForum",
  async (
    { id, forumData }: { id: number; forumData: any },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(`/forums/${id}`, forumData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Không thể cập nhật diễn đàn"
      );
    }
  }
);

// Delete forum
export const deleteForum = createAsyncThunk(
  "forums/deleteForum",
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/forums/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Không thể xóa diễn đàn");
    }
  }
);

// Fetch forum replies
export const fetchForumReplies = createAsyncThunk(
  "forums/fetchForumReplies",
  async (forumId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/forums/${forumId}/replies`);
      return { forumId, replies: response.data };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Không thể lấy danh sách bình luận"
      );
    }
  }
);

// Create forum reply
export const createForumReply = createAsyncThunk(
  "forums/createForumReply",
  async (replyData: any, { rejectWithValue }) => {
    try {
      const response = await api.post(`/forums/replies`, replyData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Không thể tạo bình luận");
    }
  }
);

// remove forum reply
export const removeForumReply = createAsyncThunk(
  "forums/removeForumReply",
  async (replyId: number, { rejectWithValue }) => {
    try {
      await api.delete(`/forums/replies/${replyId}`);
      return replyId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Không thể xóa bình luận");
    }
  }
);

// Get user like forum
export const getUserLikeForum = createAsyncThunk(
  "forums/getUserLikeForum",
  async (forumId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/forums/${forumId}/like`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Không thể lấy danh sách người thích diễn đàn"
      );
    }
  }
);

// Toggle like forum
export const toggleLikeForum = createAsyncThunk(
  "forums/toggleLikeForum",
  async (forumId: number, { rejectWithValue }) => {
    try {
      const response = await api.post(`/forums/${forumId}/like`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Không thể thích/bỏ thích diễn đàn"
      );
    }
  }
);

// Mark reply as solution
export const markAsSolution = createAsyncThunk(
  "forums/markAsSolution",
  async (
    { forumId, replyId }: { forumId: number; replyId: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(
        `/forums/${forumId}/replies/${replyId}/solution`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Không thể đánh dấu là giải pháp"
      );
    }
  }
);
