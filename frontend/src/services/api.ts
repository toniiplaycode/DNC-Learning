import axios from "axios";
import { store } from "../store/store";
import { refreshToken } from "../features/auth/authApiSlice";

const baseURL = "http://localhost:3000";

export const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Đảm bảo không gọi refresh token liên tục
let isRefreshing = false;

// Interceptor để thêm token vào header
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý response
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401 && !isRefreshing) {
      isRefreshing = true;
      try {
        const originalRequest = error.config;

        // Thử refresh token
        await store.dispatch(refreshToken());

        // Lấy token mới từ localStorage
        const newToken = localStorage.getItem("token");
        if (newToken) {
          // Cập nhật token cho request hiện tại
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          // Gửi lại request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Nếu refresh token thất bại, chuyển hướng đến trang đăng nhập
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
