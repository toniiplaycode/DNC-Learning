import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  Forum,
  ForumReply,
  fetchForums,
  fetchForumById,
  createForum,
  updateForum,
  deleteForum,
  fetchForumReplies,
  createForumReply,
  markAsSolution,
  getUserLikeForum,
  UserLikeForum,
  toggleLikeForum,
} from "./forumsApiSlice";

interface ForumsState {
  forums: Forum[];
  currentForum: Forum | null;
  replies: { [forumId: number]: ForumReply[] };
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  userLikeForum: UserLikeForum[];
}

const initialState: ForumsState = {
  forums: [],
  currentForum: null,
  replies: {},
  status: "idle",
  error: null,
  userLikeForum: [],
};

const forumsSlice = createSlice({
  name: "forums",
  initialState,
  reducers: {
    resetForumState: (state) => {
      state.status = "idle";
      state.error = null;
    },
    setCurrentForum: (state, action: PayloadAction<Forum | null>) => {
      state.currentForum = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch forums reducers
      .addCase(fetchForums.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchForums.fulfilled,
        (state, action: PayloadAction<Forum[]>) => {
          state.status = "succeeded";
          state.forums = action.payload;
          state.error = null;
        }
      )
      .addCase(fetchForums.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) ||
          "Đã xảy ra lỗi khi lấy danh sách diễn đàn";
      })

      // Fetch forum by ID reducers
      .addCase(fetchForumById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchForumById.fulfilled,
        (state, action: PayloadAction<Forum>) => {
          state.status = "succeeded";
          state.currentForum = action.payload;

          // Update in array if exists
          const index = state.forums.findIndex(
            (forum) => forum.id === action.payload.id
          );
          if (index !== -1) {
            state.forums[index] = action.payload;
          }

          state.error = null;
        }
      )
      .addCase(fetchForumById.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) ||
          "Đã xảy ra lỗi khi lấy thông tin diễn đàn";
      })

      // Create forum reducers
      .addCase(createForum.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createForum.fulfilled, (state, action: PayloadAction<Forum>) => {
        state.status = "succeeded";
        state.forums.push(action.payload);
        state.currentForum = action.payload;
        state.error = null;
      })
      .addCase(createForum.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || "Đã xảy ra lỗi khi tạo diễn đàn";
      })

      // Update forum reducers
      .addCase(updateForum.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateForum.fulfilled, (state, action: PayloadAction<Forum>) => {
        state.status = "succeeded";
        const index = state.forums.findIndex(
          (forum) => forum.id === action.payload.id
        );
        if (index !== -1) {
          state.forums[index] = action.payload;
        }
        if (state.currentForum?.id === action.payload.id) {
          state.currentForum = action.payload;
        }
        state.error = null;
      })
      .addCase(updateForum.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || "Đã xảy ra lỗi khi cập nhật diễn đàn";
      })

      // Delete forum reducers
      .addCase(deleteForum.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        deleteForum.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.status = "succeeded";
          state.forums = state.forums.filter(
            (forum) => forum.id !== action.payload
          );
          if (state.currentForum?.id === action.payload) {
            state.currentForum = null;
          }
          // Remove replies for this forum
          delete state.replies[action.payload];
          state.error = null;
        }
      )
      .addCase(deleteForum.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || "Đã xảy ra lỗi khi xóa diễn đàn";
      })

      // Fetch forum replies reducers
      .addCase(fetchForumReplies.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchForumReplies.fulfilled,
        (
          state,
          action: PayloadAction<{ forumId: number; replies: ForumReply[] }>
        ) => {
          state.status = "succeeded";
          state.replies[action.payload.forumId] = action.payload.replies;
          state.error = null;
        }
      )
      .addCase(fetchForumReplies.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) ||
          "Đã xảy ra lỗi khi lấy danh sách bình luận";
      })

      // Create forum reply reducers
      .addCase(createForumReply.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        createForumReply.fulfilled,
        (state, action: PayloadAction<ForumReply>) => {
          state.status = "succeeded";
          const forumId = action.payload.forumId;

          // Add to replies array
          if (!state.replies[forumId]) {
            state.replies[forumId] = [];
          }
          state.replies[forumId].push(action.payload);

          // Update reply count if forum exists
          const forumIndex = state.forums.findIndex((f) => f.id === forumId);
          if (forumIndex !== -1) {
            const forum = state.forums[forumIndex];
            forum.replyCount = (forum.replyCount || 0) + 1;
          }

          // Update current forum if it's the same
          if (state.currentForum?.id === forumId) {
            if (!state.currentForum.replies) {
              state.currentForum.replies = [];
            }
            state.currentForum.replies.push(action.payload);
            state.currentForum.replyCount =
              (state.currentForum.replyCount || 0) + 1;
          }

          state.error = null;
        }
      )
      .addCase(createForumReply.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || "Đã xảy ra lỗi khi tạo bình luận";
      })

      // Get user like forum reducers
      .addCase(getUserLikeForum.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        getUserLikeForum.fulfilled,
        (state, action: PayloadAction<UserLikeForum[]>) => {
          state.status = "succeeded";
          state.userLikeForum = action.payload;
        }
      )
      .addCase(getUserLikeForum.rejected, (state, action) => {
        state.status = "failed";
      })

      // Toggle like forum reducers
      .addCase(
        toggleLikeForum.fulfilled,
        (state, action: PayloadAction<Forum>) => {
          const updatedForum = action.payload;

          // Update in forums array
          const index = state.forums.findIndex((f) => f.id === updatedForum.id);
          if (index !== -1) {
            state.forums[index] = updatedForum;
          }

          // Update current forum if matching
          if (state.currentForum?.id === updatedForum.id) {
            state.currentForum = updatedForum;
          }
        }
      )

      // Mark as solution reducers
      .addCase(
        markAsSolution.fulfilled,
        (state, action: PayloadAction<Forum>) => {
          const updatedForum = action.payload;

          // Update in forums array
          const index = state.forums.findIndex((f) => f.id === updatedForum.id);
          if (index !== -1) {
            state.forums[index] = updatedForum;
            state.forums[index].isSolved = true;
          }

          // Update current forum if matching
          if (state.currentForum?.id === updatedForum.id) {
            state.currentForum = updatedForum;
            state.currentForum.isSolved = true;
          }
        }
      );
  },
});

export const { resetForumState, setCurrentForum } = forumsSlice.actions;
export default forumsSlice.reducer;
