import { RootState } from "../../store/store";
import { Instructor } from "./instructorsApiSlice";

// Lấy tất cả giảng viên
export const selectAllInstructors = (state: RootState): Instructor[] =>
  state.instructors.instructors;

// Lấy giảng viên hiện tại
export const selectCurrentInstructor = (state: RootState): Instructor | null =>
  state.instructors.currentInstructor;

// Lấy trạng thái loading
export const selectInstructorsStatus = (
  state: RootState
): "idle" | "loading" | "succeeded" | "failed" => state.instructors.status;

// Lấy thông báo lỗi
export const selectInstructorsError = (state: RootState): string | null =>
  state.instructors.error;

// Lấy thống kê
export const selectInstructorsStats = (
  state: RootState
): {
  total: number;
  verified: number;
  pending: number;
  rejected: number;
} => state.instructors.stats;

// Lấy danh sách giảng viên đã xác minh
export const selectVerifiedInstructors = (state: RootState): Instructor[] =>
  state.instructors.instructors.filter(
    (instructor) => instructor.verificationStatus === "verified"
  );

// Lấy danh sách giảng viên đang chờ xác minh
export const selectPendingInstructors = (state: RootState): Instructor[] =>
  state.instructors.instructors.filter(
    (instructor) => instructor.verificationStatus === "pending"
  );

// Lấy danh sách giảng viên bị từ chối
export const selectRejectedInstructors = (state: RootState): Instructor[] =>
  state.instructors.instructors.filter(
    (instructor) => instructor.verificationStatus === "rejected"
  );

// Lấy giảng viên theo ID
export const selectInstructorById = (
  state: RootState,
  instructorId: number
): Instructor | undefined =>
  state.instructors.instructors.find(
    (instructor) => instructor.id === instructorId
  );
