import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  Discussion,
  DiscussionState,
  CreateDiscussionData,
  UpdateDiscussionData,
} from "../../types/discussion.types";
import { api } from "../../services/api";

// Async Thunks
export const fetchDiscussions = createAsyncThunk(
  "discussions/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/course-lesson-discussions");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải thảo luận"
      );
    }
  }
);

export const fetchLessonDiscussions = createAsyncThunk(
  "discussions/fetchByLesson",
  async (lessonId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/course-lesson-discussions/lesson/${lessonId}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải thảo luận của bài học"
      );
    }
  }
);

export const fetchDiscussionById = createAsyncThunk(
  "discussions/fetchById",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/course-lesson-discussions/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải thảo luận"
      );
    }
  }
);

export const createDiscussion = createAsyncThunk(
  "discussions/create",
  async (data: CreateDiscussionData, { rejectWithValue }) => {
    try {
      const response = await api.post("/course-lesson-discussions", data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tạo thảo luận"
      );
    }
  }
);

export const updateDiscussion = createAsyncThunk(
  "discussions/update",
  async (
    { id, data }: { id: number; data: UpdateDiscussionData },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(
        `/course-lesson-discussions/${id}`,
        data
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể cập nhật thảo luận"
      );
    }
  }
);

export const deleteDiscussion = createAsyncThunk(
  "discussions/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/course-lesson-discussions/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể xóa thảo luận"
      );
    }
  }
);

export const hideDiscussion = createAsyncThunk(
  "discussions/hide",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/course-lesson-discussions/${id}/hide`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể ẩn thảo luận"
      );
    }
  }
);

// Initial state
const initialState: DiscussionState = {
  discussions: [],
  lessonDiscussions: [],
  currentDiscussion: null,
  status: "idle",
  error: null,
};

// Slice
const discussionsSlice = createSlice({
  name: "discussions",
  initialState,
  reducers: {
    resetDiscussionsState: (state) => {
      state.discussions = [];
      state.lessonDiscussions = [];
      state.currentDiscussion = null;
      state.status = "idle";
      state.error = null;
    },
    clearDiscussionsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all discussions
      .addCase(fetchDiscussions.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDiscussions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.discussions = action.payload;
        state.error = null;
      })
      .addCase(fetchDiscussions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch discussions by lesson
      .addCase(fetchLessonDiscussions.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchLessonDiscussions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.lessonDiscussions = action.payload;
        state.error = null;
      })
      .addCase(fetchLessonDiscussions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch discussion by ID
      .addCase(fetchDiscussionById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDiscussionById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentDiscussion = action.payload;
        state.error = null;
      })
      .addCase(fetchDiscussionById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Create discussion
      .addCase(createDiscussion.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createDiscussion.fulfilled, (state, action) => {
        state.status = "succeeded";
        const newDiscussion = action.payload;

        // Nếu là thảo luận gốc
        if (newDiscussion.parentId === null) {
          state.discussions.unshift(newDiscussion);
          state.lessonDiscussions.unshift(newDiscussion);
        } else {
          // Nếu là phản hồi, cập nhật replies của thảo luận cha
          state.discussions = state.discussions.map((discussion) => {
            if (discussion.id === newDiscussion.parentId) {
              return {
                ...discussion,
                replies: [...(discussion.replies || []), newDiscussion],
              };
            }
            return discussion;
          });

          state.lessonDiscussions = state.lessonDiscussions.map(
            (discussion) => {
              if (discussion.id === newDiscussion.parentId) {
                return {
                  ...discussion,
                  replies: [...(discussion.replies || []), newDiscussion],
                };
              }
              return discussion;
            }
          );
        }

        state.error = null;
      })
      .addCase(createDiscussion.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Update discussion
      .addCase(updateDiscussion.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateDiscussion.fulfilled, (state, action) => {
        state.status = "succeeded";
        const updatedDiscussion = action.payload;

        // Cập nhật trong mảng discussions
        state.discussions = state.discussions.map((discussion) => {
          if (discussion.id === updatedDiscussion.id) {
            return updatedDiscussion;
          }
          // Kiểm tra và cập nhật trong replies
          if (discussion.replies) {
            return {
              ...discussion,
              replies: discussion.replies.map((reply) =>
                reply.id === updatedDiscussion.id ? updatedDiscussion : reply
              ),
            };
          }
          return discussion;
        });

        // Cập nhật trong mảng lessonDiscussions
        state.lessonDiscussions = state.lessonDiscussions.map((discussion) => {
          if (discussion.id === updatedDiscussion.id) {
            return updatedDiscussion;
          }
          // Kiểm tra và cập nhật trong replies
          if (discussion.replies) {
            return {
              ...discussion,
              replies: discussion.replies.map((reply) =>
                reply.id === updatedDiscussion.id ? updatedDiscussion : reply
              ),
            };
          }
          return discussion;
        });

        // Cập nhật currentDiscussion nếu cần
        if (
          state.currentDiscussion &&
          state.currentDiscussion.id === updatedDiscussion.id
        ) {
          state.currentDiscussion = updatedDiscussion;
        }

        state.error = null;
      })
      .addCase(updateDiscussion.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Delete discussion
      .addCase(deleteDiscussion.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteDiscussion.fulfilled, (state, action) => {
        state.status = "succeeded";
        const id = action.payload;

        // Xóa khỏi danh sách discussions
        state.discussions = state.discussions.filter((discussion) => {
          // Xóa thảo luận có id tương ứng
          if (discussion.id === id) return false;

          // Nếu discussion có replies, lọc ra để xóa reply có id tương ứng
          if (discussion.replies) {
            discussion.replies = discussion.replies.filter(
              (reply) => reply.id !== id
            );
          }

          return true;
        });

        // Xóa khỏi danh sách lessonDiscussions
        state.lessonDiscussions = state.lessonDiscussions.filter(
          (discussion) => {
            // Xóa thảo luận có id tương ứng
            if (discussion.id === id) return false;

            // Nếu discussion có replies, lọc ra để xóa reply có id tương ứng
            if (discussion.replies) {
              discussion.replies = discussion.replies.filter(
                (reply) => reply.id !== id
              );
            }

            return true;
          }
        );

        // Nếu currentDiscussion đang là discussion bị xóa, reset nó
        if (state.currentDiscussion && state.currentDiscussion.id === id) {
          state.currentDiscussion = null;
        }

        state.error = null;
      })
      .addCase(deleteDiscussion.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Hide discussion
      .addCase(hideDiscussion.pending, (state) => {
        state.status = "loading";
      })
      .addCase(hideDiscussion.fulfilled, (state, action) => {
        state.status = "succeeded";
        const hiddenDiscussion = action.payload;

        // Cập nhật trong mảng discussions với status mới
        state.discussions = state.discussions.map((discussion) => {
          if (discussion.id === hiddenDiscussion.id) {
            return hiddenDiscussion;
          }
          // Kiểm tra và cập nhật trong replies
          if (discussion.replies) {
            return {
              ...discussion,
              replies: discussion.replies.map((reply) =>
                reply.id === hiddenDiscussion.id ? hiddenDiscussion : reply
              ),
            };
          }
          return discussion;
        });

        // Cập nhật trong mảng lessonDiscussions với status mới
        state.lessonDiscussions = state.lessonDiscussions.map((discussion) => {
          if (discussion.id === hiddenDiscussion.id) {
            return hiddenDiscussion;
          }
          // Kiểm tra và cập nhật trong replies
          if (discussion.replies) {
            return {
              ...discussion,
              replies: discussion.replies.map((reply) =>
                reply.id === hiddenDiscussion.id ? hiddenDiscussion : reply
              ),
            };
          }
          return discussion;
        });

        // Cập nhật currentDiscussion nếu cần
        if (
          state.currentDiscussion &&
          state.currentDiscussion.id === hiddenDiscussion.id
        ) {
          state.currentDiscussion = hiddenDiscussion;
        }

        state.error = null;
      })
      .addCase(hideDiscussion.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { resetDiscussionsState, clearDiscussionsError } =
  discussionsSlice.actions;

export default discussionsSlice.reducer;
