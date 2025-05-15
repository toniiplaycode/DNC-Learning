import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TeachingSchedule } from "../../types/teaching-schedule.types";

interface ActiveClassState {
  isActive: boolean;
  currentClass: TeachingSchedule | null;
  joinTime: string | null;
  elapsedTime: number; // in seconds
}

const initialState: ActiveClassState = {
  isActive: false,
  currentClass: null,
  joinTime: null,
  elapsedTime: 0,
};

const activeClassSlice = createSlice({
  name: "activeClass",
  initialState,
  reducers: {
    joinClass: (state, action: PayloadAction<TeachingSchedule>) => {
      state.isActive = true;
      state.currentClass = action.payload;
      state.joinTime = new Date().toISOString();
      state.elapsedTime = 0;
    },
    leaveClass: (state) => {
      state.isActive = false;
      state.currentClass = null;
      state.joinTime = null;
      state.elapsedTime = 0;
    },
    updateElapsedTime: (state, action: PayloadAction<number>) => {
      state.elapsedTime = action.payload;
    },
  },
});

export const { joinClass, leaveClass, updateElapsedTime } =
  activeClassSlice.actions;

export default activeClassSlice.reducer;
