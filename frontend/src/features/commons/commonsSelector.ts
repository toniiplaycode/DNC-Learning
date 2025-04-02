import { RootState } from "../../store/store";
import { User } from "../auth/authApiSlice";

// Lấy user hiện tại
export const selectUser = (state: RootState): User | null => state.commons.user;

// Lấy token hiện tại
export const selectToken = (state: RootState): string | null =>
  state.commons.token;
