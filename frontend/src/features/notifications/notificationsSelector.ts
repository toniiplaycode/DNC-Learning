import { RootState } from "../../app/store";

// Base selectors
export const selectNotificationsState = (state: RootState) =>
  state.notifications;
export const selectAllNotifications = (state: RootState) =>
  state.notifications.notifications;
export const selectUserNotifications = (state: RootState) =>
  state.notifications.userNotifications;
export const selectCurrentNotification = (state: RootState) =>
  state.notifications.currentNotification;
export const selectNotificationsStatus = (state: RootState) =>
  state.notifications.status;
export const selectNotificationsError = (state: RootState) =>
  state.notifications.error;
