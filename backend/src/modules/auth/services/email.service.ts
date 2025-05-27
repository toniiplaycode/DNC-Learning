import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    // Log email configuration for debugging
    const emailConfig = {
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      secure: this.configService.get<boolean>('EMAIL_SECURE'),
      user: this.configService.get<string>('EMAIL_USER'),
      from: this.configService.get<string>('EMAIL_FROM'),
    };
    this.logger.log('Email configuration:', {
      ...emailConfig,
      pass: '[REDACTED]',
    });

    // Check if required email credentials are present
    const user = this.configService.get<string>('EMAIL_USER');
    const pass = this.configService.get<string>('EMAIL_PASSWORD');
    if (!user || !pass) {
      this.logger.error(
        'Missing email credentials. Please check your .env file',
      );
      throw new Error('Email configuration is incomplete');
    }

    // Initialize nodemailer transporter
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST') || 'smtp.gmail.com',
      port: this.configService.get<number>('EMAIL_PORT') || 587,
      secure: this.configService.get<boolean>('EMAIL_SECURE') || false,
      auth: {
        user,
        pass,
      },
    });

    // Verify SMTP connection
    this.transporter.verify((error, success) => {
      if (error) {
        this.logger.error('SMTP connection error:', error);
      } else {
        this.logger.log('SMTP connection established successfully');
      }
    });
  }

  /**
   * Send an email
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

      this.logger.log(`Sending email to ${to}`);
      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully to ${to}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Gửi email đặt lại mật khẩu
   * @param to Email người nhận
   * @param userName Tên người nhận
   * @param resetUrl URL đặt lại mật khẩu
   * @param resetCode Mã reset
   */
  async sendResetPasswordEmail(
    to: string,
    userName: string,
    resetUrl: string,
    resetCode: string,
  ): Promise<any> {
    const subject = 'Reset Your Password';
    const content = this.generateResetPasswordEmailTemplate(
      userName,
      resetUrl,
      resetCode,
    );
    return this.sendEmail(to, subject, content);
  }

  /**
   * Tạo nội dung email đặt lại mật khẩu
   * @param userName Tên người nhận
   * @param resetUrl URL đặt lại mật khẩu
   * @param resetCode Mã reset
   */
  private generateResetPasswordEmailTemplate(
    userName: string,
    resetUrl: string,
    resetCode: string,
  ): string {
    const color = '#4CAF50'; // Màu chủ đạo cho email reset password

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Đặt Lại Mật Khẩu</title>
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
            .reset-code {
              background-color: #f5f5f5;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
              font-size: 24px;
              letter-spacing: 2px;
              color: ${color};
              font-weight: bold;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: ${color};
              color: white;
              text-decoration: none;
              border-radius: 4px;
              margin: 20px 0;
              font-weight: bold;
            }
            .button:hover {
              background-color: #45a049;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding: 25px 20px;
              background: linear-gradient(to right, #f8f9fa, #ffffff, #f8f9fa);
              border-top: 1px solid #e9ecef;
            }
            .footer-logo {
              margin-bottom: 20px;
            }
            .footer-logo img {
              width: 150px;
              height: auto;
            }
            .footer-contact {
              margin: 15px 0;
              padding: 15px;
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }
            .footer-contact p {
              margin: 8px 0;
              font-size: 14px;
              color: #495057;
            }
            .footer-contact strong {
              color: #212529;
              font-weight: 600;
            }
            .footer-copyright {
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #e9ecef;
              color: #6c757d;
              font-size: 13px;
              line-height: 1.6;
            }
            .footer-copyright p {
              margin: 5px 0;
            }
            .footer-copyright a {
              color: ${color};
              text-decoration: none;
            }
            .footer-copyright a:hover {
              text-decoration: underline;
            }
            .divider {
              display: inline-block;
              width: 4px;
              height: 4px;
              background-color: #dee2e6;
              border-radius: 50%;
              margin: 0 10px;
              vertical-align: middle;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Đặt Lại Mật Khẩu</h1>
            </div>
            <div class="content">
              <p>Xin chào ${userName},</p>
              <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng sử dụng mã sau để đặt lại mật khẩu:</p>
              <div class="reset-code">
                <strong>${resetCode}</strong>
              </div>
              <p>Mã này sẽ hết hạn sau 15 phút.</p>
              <p>Hoặc bạn có thể nhấn vào nút bên dưới để đặt lại mật khẩu:</p>
              <div class="button-container">
                <a href="${resetUrl}" class="button">Đặt Lại Mật Khẩu</a>
              </div>
              <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
            </div>
            <div class="footer">
              <p>Đây là email tự động, vui lòng không trả lời email này.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
