export interface Notification {
  id: number;
  userId: number;
  title: string;
  content: string;
  type: "course" | "assignment" | "quiz" | "system" | "message" | "schedule";
  scheduleId?: number;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  notificationTime?: string;
}

export interface NotificationState {
  notifications: Notification[];
  userNotifications: Notification[];
  currentNotification: Notification | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

export interface CreateNotificationData {
  userId: number;
  title: string;
  content: string;
  type: Notification["type"];
  scheduleId?: number;
  notificationTime?: string;
}

export interface UpdateNotificationData {
  id: number;
  isRead?: boolean;
  title?: string;
  content?: string;
  notificationTime?: string;
}
