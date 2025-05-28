import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  User,
  AuthResponse,
  registerStudent,
  login,
  logout,
  fetchCurrentUser,
  refreshToken,
} from "./authApiSlice";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

// Khởi tạo state từ localStorage nếu có
const token = localStorage.getItem("token");
const user = localStorage.getItem("user");

const initialState: AuthState = {
  user: user ? JSON.parse(user) : null,
  token: token,
  isAuthenticated: !!token,
  status: "idle",
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetAuthState: (state) => {
      state.status = "idle";
      state.error = null;
    },
    setCredentials: (state, action: PayloadAction<AuthResponse>) => {
      state.user = action.payload.user;
      state.token = action.payload.accessToken;
      state.isAuthenticated = true;
      state.status = "succeeded";
    },
    updateUserInfo: (state, action: PayloadAction<User>) => {
      // Preserve authentication state
      const currentToken = state.token;
      const currentAuthState = state.isAuthenticated;

      state.user = action.payload;
      state.token = currentToken;
      state.isAuthenticated = currentAuthState;
      state.status = "succeeded";
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    // Xử lý registerStudent
    builder
      .addCase(registerStudent.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        registerStudent.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.status = "succeeded";
          state.user = action.payload.user;
          state.token = action.payload.accessToken;
          state.isAuthenticated = true;
          state.error = null;
        }
      )
      .addCase(registerStudent.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });

    // Xử lý login
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        login.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.status = "succeeded";
          state.user = action.payload.user;
          state.token = action.payload.accessToken;
          if (action.payload.accessToken) {
            state.isAuthenticated = true;
          }
          state.error = null;
        }
      )
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });

    // Xử lý logout
    builder
      .addCase(logout.pending, (state) => {
        state.status = "loading";
      })
      .addCase(logout.fulfilled, (state) => {
        state.status = "idle";
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      });

    // Xử lý fetchCurrentUser
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Xử lý refreshToken
    builder
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload.accessToken;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const {
  resetAuthState,
  setCredentials,
  clearCredentials,
  updateUserInfo,
} = authSlice.actions;

export default authSlice.reducer;
