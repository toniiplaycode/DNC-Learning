import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  Instructor,
  fetchInstructors,
  fetchInstructorById,
  createInstructor,
  updateInstructor,
  verifyInstructor,
  rejectInstructor,
  deleteInstructor,
} from "./instructorsApiSlice";

interface InstructorsState {
  instructors: Instructor[];
  currentInstructor: Instructor | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  stats: {
    total: number;
    verified: number;
    pending: number;
    rejected: number;
  };
}

const initialState: InstructorsState = {
  instructors: [],
  currentInstructor: null,
  status: "idle",
  error: null,
  stats: {
    total: 0,
    verified: 0,
    pending: 0,
    rejected: 0,
  },
};

const instructorsSlice = createSlice({
  name: "instructors",
  initialState,
  reducers: {
    resetInstructorState: (state) => {
      state.currentInstructor = null;
      state.error = null;
    },
    setCurrentInstructor: (state, action: PayloadAction<Instructor | null>) => {
      state.currentInstructor = action.payload;
    },
    calculateStats: (state) => {
      state.stats = {
        total: state.instructors.length,
        verified: state.instructors.filter(
          (i) => i.verificationStatus === "verified"
        ).length,
        pending: state.instructors.filter(
          (i) => i.verificationStatus === "pending"
        ).length,
        rejected: state.instructors.filter(
          (i) => i.verificationStatus === "rejected"
        ).length,
      };
    },
  },
  extraReducers: (builder) => {
    // Xử lý fetchInstructors
    builder
      .addCase(fetchInstructors.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchInstructors.fulfilled,
        (state, action: PayloadAction<Instructor[]>) => {
          state.status = "succeeded";
          state.instructors = action.payload;
          state.error = null;
          // Tính toán thống kê
          state.stats = {
            total: action.payload.length,
            verified: action.payload.filter(
              (i) => i.verificationStatus === "verified"
            ).length,
            pending: action.payload.filter(
              (i) => i.verificationStatus === "pending"
            ).length,
            rejected: action.payload.filter(
              (i) => i.verificationStatus === "rejected"
            ).length,
          };
        }
      )
      .addCase(fetchInstructors.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) ||
          "Đã xảy ra lỗi khi lấy danh sách giảng viên";
      });

    // Xử lý fetchInstructorById
    builder
      .addCase(fetchInstructorById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchInstructorById.fulfilled,
        (state, action: PayloadAction<Instructor>) => {
          state.status = "succeeded";
          state.currentInstructor = action.payload;
          state.error = null;
        }
      )
      .addCase(fetchInstructorById.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) ||
          "Đã xảy ra lỗi khi lấy thông tin giảng viên";
      });

    // Xử lý createInstructor
    builder
      .addCase(createInstructor.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        createInstructor.fulfilled,
        (state, action: PayloadAction<Instructor>) => {
          state.status = "succeeded";
          state.instructors.push(action.payload);
          state.currentInstructor = action.payload;
          state.error = null;
        }
      )
      .addCase(createInstructor.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || "Đã xảy ra lỗi khi tạo giảng viên";
      });

    // Xử lý updateInstructor
    builder
      .addCase(updateInstructor.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        updateInstructor.fulfilled,
        (state, action: PayloadAction<Instructor>) => {
          state.status = "succeeded";
          const index = state.instructors.findIndex(
            (instructor) => instructor.id === action.payload.id
          );
          if (index !== -1) {
            state.instructors[index] = action.payload;
          }
          state.currentInstructor = action.payload;
          state.error = null;
        }
      )
      .addCase(updateInstructor.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) ||
          "Đã xảy ra lỗi khi cập nhật thông tin giảng viên";
      });

    // Xử lý verifyInstructor
    builder
      .addCase(verifyInstructor.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        verifyInstructor.fulfilled,
        (state, action: PayloadAction<Instructor>) => {
          state.status = "succeeded";
          const index = state.instructors.findIndex(
            (instructor) => instructor.id === action.payload.id
          );
          if (index !== -1) {
            state.instructors[index] = action.payload;
          }
          if (
            state.currentInstructor &&
            state.currentInstructor.id === action.payload.id
          ) {
            state.currentInstructor = action.payload;
          }
          state.error = null;
        }
      )
      .addCase(verifyInstructor.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || "Đã xảy ra lỗi khi xác minh giảng viên";
      });

    // Xử lý rejectInstructor
    builder
      .addCase(rejectInstructor.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        rejectInstructor.fulfilled,
        (state, action: PayloadAction<Instructor>) => {
          state.status = "succeeded";
          const index = state.instructors.findIndex(
            (instructor) => instructor.id === action.payload.id
          );
          if (index !== -1) {
            state.instructors[index] = action.payload;
          }
          if (
            state.currentInstructor &&
            state.currentInstructor.id === action.payload.id
          ) {
            state.currentInstructor = action.payload;
          }
          state.error = null;
        }
      )
      .addCase(rejectInstructor.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || "Đã xảy ra lỗi khi từ chối giảng viên";
      });

    // Xử lý deleteInstructor
    builder
      .addCase(deleteInstructor.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        deleteInstructor.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.status = "succeeded";
          state.instructors = state.instructors.filter(
            (instructor) => instructor.id !== action.payload
          );
          if (
            state.currentInstructor &&
            state.currentInstructor.id === action.payload
          ) {
            state.currentInstructor = null;
          }
          state.error = null;
        }
      )
      .addCase(deleteInstructor.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || "Đã xảy ra lỗi khi xóa giảng viên";
      });
  },
});

export const { resetInstructorState, setCurrentInstructor, calculateStats } =
  instructorsSlice.actions;
export default instructorsSlice.reducer;
