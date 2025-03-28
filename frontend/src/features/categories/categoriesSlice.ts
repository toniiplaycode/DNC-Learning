import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  Category,
  fetchCategories,
  fetchCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./categoriesApiSlice";

interface CategoriesState {
  categories: Category[];
  currentCategory: Category | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: CategoriesState = {
  categories: [],
  currentCategory: null,
  status: "idle",
  error: null,
};

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    resetCategoryState: (state) => {
      state.currentCategory = null;
      state.error = null;
    },
    setCurrentCategory: (state, action: PayloadAction<Category | null>) => {
      state.currentCategory = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Xử lý fetchCategories
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchCategories.fulfilled,
        (state, action: PayloadAction<Category[]>) => {
          state.status = "succeeded";
          state.categories = action.payload;
          state.error = null;
        }
      )
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) ||
          "Đã xảy ra lỗi khi lấy danh sách danh mục";
      });

    // Xử lý fetchCategoryById
    builder
      .addCase(fetchCategoryById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchCategoryById.fulfilled,
        (state, action: PayloadAction<Category>) => {
          state.status = "succeeded";
          state.currentCategory = action.payload;
          state.error = null;
        }
      )
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) ||
          "Đã xảy ra lỗi khi lấy thông tin danh mục";
      });

    // Xử lý createCategory
    builder
      .addCase(createCategory.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        createCategory.fulfilled,
        (state, action: PayloadAction<Category>) => {
          state.status = "succeeded";
          state.categories.push(action.payload);
          state.currentCategory = action.payload;
          state.error = null;
        }
      )
      .addCase(createCategory.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || "Đã xảy ra lỗi khi tạo danh mục";
      });

    // Xử lý updateCategory
    builder
      .addCase(updateCategory.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        updateCategory.fulfilled,
        (state, action: PayloadAction<Category>) => {
          state.status = "succeeded";
          const index = state.categories.findIndex(
            (category) => category.id === action.payload.id
          );
          if (index !== -1) {
            state.categories[index] = action.payload;
          }
          state.currentCategory = action.payload;
          state.error = null;
        }
      )
      .addCase(updateCategory.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || "Đã xảy ra lỗi khi cập nhật danh mục";
      });

    // Xử lý deleteCategory
    builder
      .addCase(deleteCategory.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        deleteCategory.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.status = "succeeded";
          state.categories = state.categories.filter(
            (category) => category.id !== action.payload
          );
          if (state.currentCategory?.id === action.payload) {
            state.currentCategory = null;
          }
          state.error = null;
        }
      )
      .addCase(deleteCategory.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || "Đã xảy ra lỗi khi xóa danh mục";
      });
  },
});

export const { resetCategoryState, setCurrentCategory } =
  categoriesSlice.actions;
export default categoriesSlice.reducer;
