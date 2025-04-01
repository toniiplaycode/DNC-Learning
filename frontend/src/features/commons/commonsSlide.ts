import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../auth/authApiSlice";

interface CommonsState {
  user: User | null;
  search: string | null;
  token: string | null;
  isAuthenticated: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

// Khởi tạo state từ localStorage nếu có
const token = localStorage.getItem("token");
const user = localStorage.getItem("user");

const initialState: CommonsState = {
  user: user ? JSON.parse(user) : null,
  search: null,
  token: token,
  isAuthenticated: !!token,
  status: "idle",
  error: null,
};

const commonsSlice = createSlice({
  name: "commons",
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string | null>) => {
      state.search = action.payload;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
    },
  },
});

export const { setSearch, setUser, setToken } = commonsSlice.actions;

export default commonsSlice.reducer;
