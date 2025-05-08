/**
 * Example file showing how to use the email notification features
 * This is for documentation purposes only and not meant to be executed directly
 */

import { NotificationsService } from '../notifications.service';
import { EmailService } from '../services/email.service';
import { NotificationType } from '../../../entities/Notification';

// Example: How to use the EmailService directly
async function sendDirectEmail(emailService: EmailService) {
  try {
    // Generate email content using template
    const emailContent = emailService.generateNotificationEmailTemplate(
      'Thông báo quan trọng',
      'Đây là nội dung thông báo quan trọng từ hệ thống.',
      'system',
    );

    // Send email
    await emailService.sendEmail(
      'student@example.com',
      'Thông báo quan trọng',
      emailContent,
    );

    console.log('Email sent successfully');
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

// Example: How to create notifications with automatic emails
async function createNotificationWithEmail(
  notificationsService: NotificationsService,
) {
  try {
    const notifications = await notificationsService.create({
      userIds: ['1', '2', '3'], // User IDs to notify
      title: 'Khóa học mới đã được thêm',
      content: 'Khóa học "JavaScript Nâng Cao" đã được thêm vào hệ thống.',
      type: NotificationType.COURSE,
      // sendEmail: true, (mặc định là true nếu không được chỉ định)
    });

    console.log(`Created ${notifications.length} notifications with emails`);
  } catch (error) {
    console.error('Failed to create notifications:', error);
  }
}

// Example: How to create notifications without sending emails
async function createNotificationWithoutEmail(
  notificationsService: NotificationsService,
) {
  try {
    const notifications = await notificationsService.create({
      userIds: ['1', '2', '3'],
      title: 'Cập nhật giao diện',
      content: 'Giao diện hệ thống đã được cập nhật.',
      type: NotificationType.SYSTEM,
      sendEmail: false, // Disable email sending
    });

    console.log(`Created ${notifications.length} notifications without emails`);
  } catch (error) {
    console.error('Failed to create notifications:', error);
  }
}

// Example: How to use in a controller or service method
export async function handleCourseCompletion(
  notificationsService: NotificationsService,
  userId: number,
  courseName: string,
) {
  // Create notification record in database and send email
  await notificationsService.create({
    userIds: [userId.toString()],
    title: 'Chúc mừng!',
    content: `Bạn đã hoàn thành khóa học "${courseName}". Chứng chỉ của bạn đã sẵn sàng để tải xuống.`,
    type: NotificationType.COURSE,
  });
}

// Example: How to use in a React component (frontend)
/* 
import { useState } from 'react';
import axios from 'axios';

function NotificationComponent() {
  const [sending, setSending] = useState(false);
  
  const sendNotification = async () => {
    setSending(true);
    try {
      await axios.post('/api/notifications', {
        userIds: ['123'],
        title: 'Nhắc nhở về bài tập',
        content: 'Bạn có bài tập cần hoàn thành trước ngày mai.',
        type: 'assignment',
        sendEmail: true
      });
      
      alert('Notification sent successfully');
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Failed to send notification');
    } finally {
      setSending(false);
    }
  };
  
  return (
    <button 
      onClick={sendNotification} 
      disabled={sending}
    >
      {sending ? 'Sending...' : 'Send Notification'}
    </button>
  );
}
*/
