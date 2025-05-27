import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../services/api";
import { toast } from "react-toastify";

// Interface cho dữ liệu user
export interface User {
  id: string;
  username: string;
  email: string;
  role: "student" | "instructor" | "admin";
  fullName?: string;
  avatarUrl?: string;
  phone?: string;
  status?: "active" | "inactive";
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
  twoFactorEnabled?: boolean;
  userStudentAcademic?: {
    id: string;
    fullName: string;
    studentId: string;
    academicClass?: {
      id: string;
      classCode: string;
      className: string;
      semester: string;
      status: string;
    };
  } | null;
  userInstructor?: {
    id: string;
    fullName: string;
    professionalTitle: string;
  } | null;
}

// Interface cho dữ liệu đăng nhập/đăng ký thành công
export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
}

// Interface cho dữ liệu đăng ký học viên
export interface RegisterStudentData {
  username: string;
  email: string;
  password: string;
  fullName: string;
}

// Interface cho dữ liệu đăng nhập
export interface LoginData {
  email: string;
  password: string;
}

// Đăng ký học viên
export const registerStudent = createAsyncThunk(
  "auth/registerStudent",
  async (data: RegisterStudentData) => {
    try {
      const response = await api.post("/auth/register/student", data);

      if (
        response.data.accessToken ||
        response.data.refreshToken ||
        response.data.user
      ) {
        localStorage.setItem("token", response.data.accessToken);
        localStorage.setItem("refreshToken", response.data.refreshToken);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      return response.data as AuthResponse;
    } catch (error: any) {
      return error.response?.data || "Đăng ký không thành công";
    }
  }
);

// Đăng nhập
export const login = createAsyncThunk("auth/login", async (data: LoginData) => {
  try {
    console.log(data);
    const response = await api.post("/auth/login", data);

    if (
      response.data.accessToken ||
      response.data.refreshToken ||
      response.data.user
    ) {
      localStorage.setItem("token", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response.data as AuthResponse;
  } catch (error: any) {
    return error.response?.data || "Đăng nhập không thành công";
  }
});

// Đăng xuất
export const logout = createAsyncThunk("auth/logout", async () => {
  // Xóa token khỏi localStorage
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  localStorage.removeItem("saved_quiz_state");
  return null;
});

// Lấy thông tin user từ token
export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_) => {
    try {
      const response = await api.get("/auth/profile");
      if (response.data) {
        localStorage.setItem("user", JSON.stringify(response.data));
      }
      return response.data;
    } catch (error: any) {
      return error.response?.data || "Không thể lấy thông tin người dùng";
    }
  }
);

// Refresh token
export const refreshToken = createAsyncThunk("auth/refreshToken", async (_) => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      throw new Error("Không có refresh token");
    }

    const response = await api.post("/auth/refresh-token", { refreshToken });

    // Cập nhật token mới vào localStorage
    localStorage.setItem("token", response.data.accessToken);
    if (response.data.refreshToken) {
      localStorage.setItem("refreshToken", response.data.refreshToken);
    }

    return response.data as AuthResponse;
  } catch (error: any) {
    return error.response?.data || "Không thể refresh token";
  }
});

// Thêm các API endpoint cho quên mật khẩu và đặt lại mật khẩu
export const forgotPassword = async (email: string) => {
  try {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      "Có lỗi xảy ra khi gửi email đặt lại mật khẩu";
    toast.error(message);
    throw new Error(message);
  }
};

export const resetPassword = async ({
  emailHash,
  resetCode,
  password,
}: {
  emailHash: string;
  resetCode: string;
  password: string;
}) => {
  try {
    const response = await api.post("/auth/reset-password", {
      emailHash,
      resetCode,
      password,
    });
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || "Có lỗi xảy ra khi đặt lại mật khẩu";
    toast.error(message);
    throw new Error(message);
  }
};
