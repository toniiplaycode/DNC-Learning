import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../services/api";
import { GroupMessage } from "../../types/groupMessage.types";

interface GroupMessagesState {
  messages: Record<string, GroupMessage[]>;
  academicClasses: Record<string, AcademicClass>;
  loading: boolean;
  error: string | null;
}

interface AcademicClass {
  id: string;
  classCode: string;
  className: string;
  semester: string;
  status: string;
}

const initialState: GroupMessagesState = {
  messages: {},
  academicClasses: {},
  loading: false,
  error: null,
};

export const fetchMessagesByClass = createAsyncThunk(
  "groupMessages/fetchByClass",
  async (classId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/group-messages/class/${classId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch messages"
      );
    }
  }
);

export const sendGroupMessage = createAsyncThunk(
  "groupMessages/send",
  async (
    data: { classId: string; messageText: string; replyToId?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("/group-messages", data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to send message"
      );
    }
  }
);

const groupMessagesSlice = createSlice({
  name: "groupMessages",
  initialState,
  reducers: {
    setMessages: (
      state,
      action: PayloadAction<Record<string, GroupMessage[]>>
    ) => {
      state.messages = action.payload;
    },
    addMessage: (state, action: PayloadAction<GroupMessage>) => {
      const { classId } = action.payload;
      if (!state.messages[classId]) {
        state.messages[classId] = [];
      }
      state.messages[classId].push(action.payload);
    },
    setAcademicClass: (state, action: PayloadAction<AcademicClass>) => {
      state.academicClasses[action.payload.id] = action.payload;
    },
    clearMessages: (state, action: PayloadAction<string>) => {
      delete state.messages[action.payload];
      delete state.academicClasses[action.payload];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessagesByClass.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessagesByClass.fulfilled, (state, action) => {
        const { messages, academicClass } = action.payload;
        state.messages[academicClass.id] = messages;
        state.academicClasses[academicClass.id] = academicClass;
        state.loading = false;
      })
      .addCase(fetchMessagesByClass.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch messages";
      })
      .addCase(sendGroupMessage.fulfilled, (state, action) => {
        const message = action.payload;
        const { classId } = message;
        if (!state.messages[classId]) {
          state.messages[classId] = [];
        }
        state.messages[classId].push(message);
      });
  },
});

export const {
  setMessages,
  addMessage,
  setAcademicClass,
  clearMessages,
  setLoading,
  setError,
} = groupMessagesSlice.actions;

export default groupMessagesSlice.reducer;
