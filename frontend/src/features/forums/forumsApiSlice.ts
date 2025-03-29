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

// Create forum
export const createForum = createAsyncThunk(
  "forums/createForum",
  async (forumData: Partial<Forum>, { rejectWithValue }) => {
    try {
      const response = await api.post("/forums", forumData);
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
    { id, forumData }: { id: number; forumData: Partial<Forum> },
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
  async (replyData: Partial<ForumReply>, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/forums/${replyData.forumId}/replies`,
        replyData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Không thể tạo bình luận");
    }
  }
);

// Like forum
export const likeForum = createAsyncThunk(
  "forums/likeForum",
  async (forumId: number, { rejectWithValue }) => {
    try {
      const response = await api.post(`/forums/${forumId}/like`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Không thể thích diễn đàn"
      );
    }
  }
);

// Unlike forum
export const unlikeForum = createAsyncThunk(
  "forums/unlikeForum",
  async (forumId: number, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/forums/${forumId}/like`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Không thể bỏ thích diễn đàn"
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
