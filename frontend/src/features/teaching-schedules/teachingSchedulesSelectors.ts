import { RootState } from "../../app/store";
import { createSelector } from "@reduxjs/toolkit";
import { ScheduleStatus } from "../../types/teaching-schedule.types";
// Base selectors
export const selectTeachingSchedulesState = (state: RootState) =>
  state.teachingSchedules;
export const selectAllTeachingSchedules = (state: RootState) =>
  state.teachingSchedules.teachingSchedules;
export const selectClassSchedules = (state: RootState) =>
  state.teachingSchedules.classSchedules;
export const selectInstructorSchedules = (state: RootState) =>
  state.teachingSchedules.instructorSchedules;
export const selectStudentSchedules = (state: RootState) =>
  state.teachingSchedules.studentSchedules;
export const selectCurrentSchedule = (state: RootState) =>
  state.teachingSchedules.currentSchedule;
export const selectInstructorDetails = (state: RootState) =>
  state.teachingSchedules.instructorDetails;
export const selectTeachingSchedulesStatus = (state: RootState) =>
  state.teachingSchedules.status;
export const selectTeachingSchedulesError = (state: RootState) =>
  state.teachingSchedules.error;

// Derived selectors
export const selectScheduleById = (id: number) =>
  createSelector(
    [selectAllTeachingSchedules],
    (schedules) => schedules.find((schedule) => schedule.id === id) || null
  );

// Lấy các buổi học có bản ghi
export const selectSchedulesWithRecording = createSelector(
  [selectAllTeachingSchedules],
  (schedules) =>
    schedules
      .filter(
        (schedule) => schedule.recordingUrl && schedule.recordingUrl.length > 0
      )
      .sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      )
);

// Lấy buổi học theo lớp
export const selectSchedulesByAcademicClass = (academicClassId: number) =>
  createSelector([selectAllTeachingSchedules], (schedules) =>
    schedules
      .filter((schedule) => schedule.academicClassId === academicClassId)
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      )
  );

// Lấy buổi học theo giảng viên
export const selectSchedulesByInstructor = (instructorId: number) =>
  createSelector([selectAllTeachingSchedules], (schedules) =>
    schedules
      .filter(
        (schedule) =>
          schedule.academicClassInstructor?.instructor?.id === instructorId
      )
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      )
  );

// Lấy các buổi học trong ngày hôm nay
export const selectTodaySchedules = createSelector(
  [selectAllTeachingSchedules],
  (schedules) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return schedules
      .filter((schedule) => {
        const scheduleDate = new Date(schedule.startTime);
        return scheduleDate >= today && scheduleDate < tomorrow;
      })
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
  }
);

// Lấy thông tin buổi học theo loại lặp lại
export const selectRecurringSchedules = createSelector(
  [selectAllTeachingSchedules],
  (schedules) => schedules.filter((schedule) => schedule.isRecurring)
);

// Lấy các buổi học sắp tới cho sinh viên
export const selectUpcomingStudentSchedules = createSelector(
  [selectStudentSchedules],
  (schedules) => {
    const now = new Date();
    return schedules
      .filter(
        (schedule) =>
          new Date(schedule.startTime) > now &&
          schedule.status === ScheduleStatus.SCHEDULED
      )
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
  }
);

// Lấy các buổi học đã hoàn thành cho sinh viên
export const selectCompletedStudentSchedules = createSelector(
  [selectStudentSchedules],
  (schedules) =>
    schedules
      .filter((schedule) => schedule.status === ScheduleStatus.COMPLETED)
      .sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      )
);

// Lấy buổi học trong ngày hôm nay cho sinh viên
export const selectTodayStudentSchedules = createSelector(
  [selectStudentSchedules],
  (schedules) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return schedules
      .filter((schedule) => {
        const scheduleDate = new Date(schedule.startTime);
        return scheduleDate >= today && scheduleDate < tomorrow;
      })
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
  }
);

// Lấy buổi học gần nhất sắp diễn ra cho sinh viên
export const selectNextStudentSchedule = createSelector(
  [selectUpcomingStudentSchedules],
  (upcomingSchedules) => upcomingSchedules[0] || null
);
