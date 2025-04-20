import { RootState } from "../../app/store";
import { createSelector } from "@reduxjs/toolkit";

// Base selector
const selectMessagesState = (state: RootState) => state.messages;

// Existing selectors
export const selectAllMessages = (state: RootState) => state.messages.messages;
export const selectMessagesLoading = (state: RootState) =>
  state.messages.loading;
export const selectMessagesError = (state: RootState) => state.messages.error;
export const selectSelectedReceiverId = (state: RootState) =>
  state.messages.selectedReceiverId;

// New memoized selectors
export const selectUnreadMessagesCount = createSelector(
  selectAllMessages,
  (messages) => messages.filter((msg) => !msg.isRead).length
);

export const selectMessagesByReceiver = createSelector(
  [selectAllMessages, (_: RootState, receiverId: number) => receiverId],
  (messages, receiverId) =>
    messages
      .filter(
        (msg) => msg.senderId === receiverId || msg.receiverId === receiverId
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
);

export const selectLatestMessageByReceiver = createSelector(
  [selectAllMessages, (_: RootState, receiverId: number) => receiverId],
  (messages, receiverId) =>
    messages
      .filter(
        (msg) => msg.senderId === receiverId || msg.receiverId === receiverId
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0]
);

export const selectUnreadMessagesByReceiver = createSelector(
  [selectAllMessages, (_: RootState, receiverId: number) => receiverId],
  (messages, receiverId) =>
    messages.filter((msg) => msg.senderId === receiverId && !msg.isRead).length
);

export const selectGroupedMessagesByDate = createSelector(
  selectAllMessages,
  (messages) => {
    const grouped = messages.reduce((acc, message) => {
      const date = new Date(message.createdAt).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(message);
      return acc;
    }, {} as Record<string, typeof messages>);

    // Sort messages within each group
    Object.keys(grouped).forEach((date) => {
      grouped[date].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    });

    return grouped;
  }
);
