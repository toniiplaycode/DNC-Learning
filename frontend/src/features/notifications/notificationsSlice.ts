import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { NotificationState } from "../../types/notifications.types";
import { api } from "../../services/api";

// Async thunks
export const fetchAllNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/notifications");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải thông báo"
      );
    }
  }
);

export const fetchUserNotifications = createAsyncThunk(
  "notifications/fetchByUser",
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/notifications/user/${userId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Không thể tải thông báo của người dùng"
      );
    }
  }
);

export const createNotification = createAsyncThunk(
  "notifications/create",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await api.post("/notifications", data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tạo thông báo"
      );
    }
  }
);

export const markAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/notifications/${id}/read`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể đánh dấu đã đọc"
      );
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async (userId: number, { rejectWithValue }) => {
    try {
      await api.patch(`/notifications/user/${userId}/read-all`);
      return userId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể đánh dấu tất cả là đã đọc"
      );
    }
  }
);

// Add this with other async thunks
export const deleteNotification = createAsyncThunk(
  "notifications/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/notifications/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể xóa thông báo"
      );
    }
  }
);

const initialState: NotificationState = {
  notifications: [],
  userNotifications: [],
  currentNotification: null,
  status: "idle",
  error: null,
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    resetNotificationsState: (state) => {
      state.notifications = [];
      state.userNotifications = [];
      state.currentNotification = null;
      state.status = "idle";
      state.error = null;
    },
    clearNotificationsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all notifications
      .addCase(fetchAllNotifications.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAllNotifications.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.notifications = action.payload;
        state.error = null;
      })
      .addCase(fetchAllNotifications.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch user notifications
      .addCase(fetchUserNotifications.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUserNotifications.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.userNotifications = action.payload;
        state.error = null;
      })
      .addCase(fetchUserNotifications.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Create notification
      .addCase(createNotification.fulfilled, (state, action) => {
        state.notifications.unshift(action.payload);
        if (
          state.userNotifications.length > 0 &&
          action.payload.userId === state.userNotifications[0]?.userId
        ) {
          state.userNotifications.unshift(action.payload);
        }
      })

      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const updatedNotification = action.payload;
        state.notifications = state.notifications.map((notification) =>
          notification.id === updatedNotification.id
            ? updatedNotification
            : notification
        );
        state.userNotifications = state.userNotifications.map((notification) =>
          notification.id === updatedNotification.id
            ? updatedNotification
            : notification
        );
      })

      // Mark all as read
      .addCase(markAllAsRead.fulfilled, (state, action) => {
        state.userNotifications = state.userNotifications.map(
          (notification) => ({
            ...notification,
            isRead: true,
          })
        );
        state.error = null;
      })

      // Add this case in extraReducers
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.notifications = state.notifications.filter(
          (notification) => notification.id !== deletedId
        );
        state.userNotifications = state.userNotifications.filter(
          (notification) => notification.id !== deletedId
        );
        state.error = null;
      });
  },
});

export const { resetNotificationsState, clearNotificationsError } =
  notificationsSlice.actions;
export default notificationsSlice.reducer;
