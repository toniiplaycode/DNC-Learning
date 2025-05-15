import { RootState } from "../../app/store";

// Base selectors
export const selectSessionAttendancesState = (state: RootState) =>
  state.sessionAttendances;
export const selectAllAttendances = (state: RootState) =>
  state.sessionAttendances.attendances;
export const selectCurrentAttendance = (state: RootState) =>
  state.sessionAttendances.currentAttendance;
export const selectScheduleStats = (state: RootState) =>
  state.sessionAttendances.stats.scheduleStats;
export const selectStudentStats = (state: RootState) =>
  state.sessionAttendances.stats.studentStats;
export const selectSessionAttendancesStatus = (state: RootState) =>
  state.sessionAttendances.status;
export const selectSessionAttendancesError = (state: RootState) =>
  state.sessionAttendances.error;
