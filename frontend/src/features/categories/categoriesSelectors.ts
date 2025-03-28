import { RootState } from "../../store/store";
import { Category } from "./categoriesApiSlice";

// Lấy tất cả categories
export const selectAllCategories = (state: RootState): Category[] =>
  state.categories.categories;

// Lấy category hiện tại
export const selectCurrentCategory = (state: RootState): Category | null =>
  state.categories.currentCategory;

// Lấy trạng thái loading
export const selectCategoriesStatus = (
  state: RootState
): "idle" | "loading" | "succeeded" | "failed" => state.categories.status;

// Lấy thông báo lỗi
export const selectCategoriesError = (state: RootState): string | null =>
  state.categories.error;

// Lấy danh sách các category đang hoạt động
export const selectActiveCategories = (state: RootState): Category[] =>
  state.categories.categories.filter(
    (category) => category.status === "active"
  );

// Lấy category theo ID
export const selectCategoryById = (
  state: RootState,
  categoryId: number
): Category | undefined =>
  state.categories.categories.find((category) => category.id === categoryId);
