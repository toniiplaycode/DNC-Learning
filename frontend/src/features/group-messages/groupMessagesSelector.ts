import { RootState } from "../../app/store";
import { createSelector } from "@reduxjs/toolkit";

// Base selector
const selectGroupMessagesState = (state: RootState) => state.groupMessages;

// Existing selectors
export const selectAllGroupMessages = (state: RootState) =>
  state.groupMessages.messages;
export const selectGroupMessagesLoading = (state: RootState) =>
  state.groupMessages.loading;
export const selectGroupMessagesError = (state: RootState) =>
  state.groupMessages.error;
export const selectAcademicClasses = (state: RootState) =>
  state.groupMessages.academicClasses;

// Memoized selectors
export const selectGroupMessagesByClass = (classId: string) =>
  createSelector(
    [selectAllGroupMessages],
    (messages) => messages[classId] || []
  );

export const selectAcademicClass = (classId: string) =>
  createSelector(
    [selectAcademicClasses],
    (academicClasses) => academicClasses[classId]
  );

export const selectLatestGroupMessage = (classId: string) =>
  createSelector([selectAllGroupMessages], (messages) => {
    const classMessages = messages[classId] || [];
    return classMessages[classMessages.length - 1] || null;
  });
