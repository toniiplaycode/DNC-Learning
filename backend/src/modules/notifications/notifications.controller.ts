import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationEmailDto } from './dto/notification-email.dto';
import { EmailService } from './services/email.service';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailService,
  ) {}

  @Post()
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    const notifications = await this.notificationsService.create(
      createNotificationDto,
    );
    return {
      message: `Đã tạo thông báo cho ${notifications.length} người dùng`,
      notifications,
    };
  }

  /**
   * Send a direct email notification without creating a notification record
   */
  @Post('email')
  @UseGuards(JwtAuthGuard)
  async sendEmailNotification(@Body() emailDto: NotificationEmailDto) {
    try {
      const emailContent = this.emailService.generateNotificationEmailTemplate(
        emailDto.title,
        emailDto.content,
        emailDto.type,
      );

      await this.emailService.sendEmail(
        emailDto.email,
        emailDto.title,
        emailContent,
      );

      return {
        success: true,
        message: `Đã gửi email thông báo đến ${emailDto.email}`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Không thể gửi email: ${error.message}`,
      };
    }
  }

  @Get()
  findAll() {
    return this.notificationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(+id);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.notificationsService.findByUser(+userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ) {
    return this.notificationsService.update(+id, updateNotificationDto);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(+id);
  }

  @Patch('user/:userId/read-all')
  markAllAsRead(@Param('userId') userId: string) {
    return this.notificationsService.markAllAsRead(+userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(+id);
  }
}
