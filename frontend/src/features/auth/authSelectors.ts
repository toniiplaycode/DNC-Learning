import { RootState } from "../../store/store";
import { User } from "./authApiSlice";

// Lấy user hiện tại
export const selectCurrentUser = (state: RootState): User | null =>
  state.auth.user;

// Kiểm tra trạng thái xác thực
export const selectIsAuthenticated = (state: RootState): boolean =>
  state.auth.isAuthenticated;

// Lấy token hiện tại
export const selectToken = (state: RootState): string | null =>
  state.auth.token;

// Lấy trạng thái loading
export const selectAuthStatus = (
  state: RootState
): "idle" | "loading" | "succeeded" | "failed" => state.auth.status;

// Lấy thông báo lỗi
export const selectAuthError = (state: RootState): string | null =>
  state.auth.error;

// Kiểm tra vai trò của user
export const selectUserRole = (state: RootState): string | null =>
  state.auth.user?.role || null;

// Kiểm tra xem user có phải là admin không
export const selectIsAdmin = (state: RootState): boolean =>
  state.auth.user?.role === "admin";

// Kiểm tra xem user có phải là instructor không
export const selectIsInstructor = (state: RootState): boolean =>
  state.auth.user?.role === "instructor";

// Kiểm tra xem user có phải là student không
export const selectIsStudent = (state: RootState): boolean =>
  state.auth.user?.role === "student";
