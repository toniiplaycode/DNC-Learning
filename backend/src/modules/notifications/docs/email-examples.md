# Email Notification Examples

This document provides examples of how to use the email notification system in DNC Learning.

## Creating a Notification with Email

When creating a notification, an email will be sent automatically to the user's email address:

```typescript
// Example: Send a notification about a new course enrollment
const notificationData = {
  userIds: ["123"], // User ID(s) to notify
  title: "Đăng ký khóa học thành công",
  content: `Bạn đã đăng ký thành công khóa học "${courseName}"`,
  type: "course" as NotificationType,
  sendEmail: true, // Optional, defaults to true
};

// Create notification (will also send email)
await notificationsService.create(notificationData);
```

## Disabling Email for Specific Notifications

You can disable email sending for specific notifications by setting `sendEmail` to `false`:

```typescript
// Example: Create a notification without sending email
const notificationData = {
  userIds: ["123"],
  title: "Cập nhật hệ thống",
  content: "Hệ thống sẽ bảo trì vào ngày 01/01/2023",
  type: "system" as NotificationType,
  sendEmail: false, // Disable email sending
};

// Create notification (will NOT send email)
await notificationsService.create(notificationData);
```

## Sending a Direct Email Notification

You can send an email notification directly without creating a notification record:

```typescript
// Example: Send a direct email notification
const emailDto = {
  email: "user@example.com",
  title: "Thông báo về bài kiểm tra",
  content: "Bài kiểm tra của bạn đã được chấm điểm. Kết quả: 95/100",
  type: "quiz" as NotificationType,
};

// Send email directly
await notificationsController.sendEmailNotification(emailDto);
```

## API Examples

### Create Notification (with email)

**POST** `/notifications`

```json
{
  "userIds": ["1", "2", "3"],
  "title": "Thông báo mới",
  "content": "Nội dung thông báo",
  "type": "course",
  "sendEmail": true
}
```

### Send Direct Email Notification

**POST** `/notifications/email`

```json
{
  "email": "student@example.com",
  "title": "Thông báo bài tập",
  "content": "Bạn có bài tập mới cần hoàn thành trước ngày 20/12/2023",
  "type": "assignment"
}
```

## Using in Frontend Components

Example of creating a notification from a frontend component:

```typescript
// In a React component
const sendNotification = async () => {
  try {
    const response = await fetch("/api/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userIds: [studentId],
        title: "Nhắc nhở bài tập",
        content: "Bạn có bài tập sắp đến hạn nộp",
        type: "assignment",
      }),
    });

    const data = await response.json();
    if (data.notifications) {
      // Notification sent successfully
      toast.success("Đã gửi thông báo");
    }
  } catch (error) {
    console.error("Error sending notification:", error);
    toast.error("Không thể gửi thông báo");
  }
};
```
