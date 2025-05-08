import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // Initialize nodemailer transporter
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST') || 'smtp.gmail.com',
      port: this.configService.get<number>('EMAIL_PORT') || 587,
      secure: this.configService.get<boolean>('EMAIL_SECURE') || false,
      auth: {
        user:
          this.configService.get<string>('EMAIL_USER') ||
          'your-email@gmail.com',
        pass:
          this.configService.get<string>('EMAIL_PASSWORD') || 'your-password',
      },
    });
  }

  /**
   * Send an email notification
   * @param to Recipient email address
   * @param subject Email subject
   * @param content Email content (HTML)
   * @returns Promise with the result of sending the email
   */
  async sendEmail(to: string, subject: string, content: string): Promise<any> {
    try {
      const mailOptions = {
        from:
          this.configService.get<string>('EMAIL_FROM') ||
          'DNC Learning <noreply@dnclearning.com>',
        to,
        subject,
        html: content,
      };

      return await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Generate HTML email template for notifications
   * @param title Notification title
   * @param content Notification content
   * @param type Notification type
   * @returns HTML string for email
   */
  generateNotificationEmailTemplate(
    title: string,
    content: string,
    type: string,
  ): string {
    const typeColors = {
      course: '#4caf50',
      assignment: '#2196f3',
      quiz: '#ff9800',
      system: '#9c27b0',
      message: '#e91e63',
      schedule: '#607d8b',
    };

    const typeIcons = {
      course: '🎓',
      assignment: '📝',
      quiz: '❓',
      system: '⚙️',
      message: '💬',
      schedule: '📅',
    };

    const typeIntros = {
      course: 'Thông báo khóa học mới',
      assignment: 'Bài tập mới cần hoàn thành',
      quiz: 'Bài kiểm tra mới đang chờ bạn',
      system: 'Thông báo từ hệ thống',
      message: 'Bạn có tin nhắn mới',
      schedule: 'Lịch học mới đã được cập nhật',
    };

    const typeFooters = {
      course: 'Truy cập ngay để bắt đầu học!',
      assignment: 'Hãy hoàn thành bài tập đúng hạn nhé!',
      quiz: 'Hãy chuẩn bị kỹ càng trước khi làm bài kiểm tra!',
      system: 'Cảm ơn bạn đã sử dụng DNC Learning!',
      message: 'Hãy kiểm tra hộp thư của bạn!',
      schedule: 'Lưu lịch và chuẩn bị cho buổi học nhé!',
    };

    const color = typeColors[type] || '#333333';
    const icon = typeIcons[type] || '📢';
    const intro = typeIntros[type] || 'Thông báo mới';
    const footer = typeFooters[type] || 'Cảm ơn bạn đã sử dụng DNC Learning!';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          body { 
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
          }
          .header {
            background-color: ${color};
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
          }
          .content {
            padding: 20px;
            border: 1px solid #ddd;
            border-top: none;
            border-radius: 0 0 5px 5px;
            background-color: #f9f9f9;
            text-align: center;
          }
          .content p {
            font-size: 16px;
            margin: 15px 0;
            line-height: 1.6;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #777;
          }
          .icon {
            font-size: 48px;
            margin-bottom: 10px;
          }
          .intro {
            font-style: italic;
            color: #666;
            margin-bottom: 20px;
          }
          .type-footer {
            font-weight: bold;
            margin-top: 20px;
            color: ${color};
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>${title}</h2>
        </div>
        <div class="content">
          <div class="icon">${icon}</div>
          <div class="intro">${intro}</div>
          <div style="text-align: center; margin: 0 auto; padding: 10px 0;">
            <p style="font-size: 18px; line-height: 1.6; color: #333; margin: 15px 0;">${content}</p>
          </div>
          <div class="type-footer">${footer}</div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} DNC Learning. All rights reserved.</p>
          <p>Đây là email tự động, vui lòng không trả lời email này.</p>
        </div>
      </body>
      </html>
    `;
  }
}
