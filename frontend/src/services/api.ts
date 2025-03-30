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

// Interceptor để thêm token vào header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
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
    const originalRequest = error.config;

    // Nếu lỗi 401 (Unauthorized) và chưa thử refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
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
      }
    }

    return Promise.reject(error);
  }
);
