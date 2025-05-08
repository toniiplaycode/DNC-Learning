import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Message } from "../../types/message.types";
import { api } from "../../services/api";

interface MessagesState {
  messages: Message[];
  loading: boolean;
  error: string | null;
  selectedReceiverId: number | null;
}

const initialState: MessagesState = {
  messages: [],
  loading: false,
  error: null,
  selectedReceiverId: null,
};

export const fetchMessagesByUser = createAsyncThunk(
  "messages/fetchByUser",
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/messages/user/${userId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch messages"
      );
    }
  }
);

export const sendMessage = createAsyncThunk(
  "messages/sendMessage",
  async (
    data: { receiverId: number; messageText: string; referenceLink?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("/messages", data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to send message"
      );
    }
  }
);

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.unshift(action.payload);
    },
    setSelectedReceiver: (state, action: PayloadAction<number>) => {
      state.selectedReceiverId = action.payload;
    },
    markMessageAsRead: (state, action: PayloadAction<number>) => {
      const message = state.messages.find((m) => m.id === action.payload);
      if (message) {
        message.isRead = true;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    updateMessageStatus: (
      state,
      action: PayloadAction<{
        messageId: number;
        status: { isRead?: boolean; id?: number };
      }>
    ) => {
      const message = state.messages.find(
        (m) => m.id === action.payload.messageId
      );
      if (message) {
        Object.assign(message, action.payload.status);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessagesByUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessagesByUser.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessagesByUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Không thể tải tin nhắn";
      });
  },
});

export const {
  setMessages,
  addMessage,
  setSelectedReceiver,
  markMessageAsRead,
  setLoading,
  setError,
  updateMessageStatus,
} = messagesSlice.actions;

export default messagesSlice.reducer;
