import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from '../../entities/Notification';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { EmailService } from './services/email.service';
import { User } from '../../entities/User';
import { In } from 'typeorm';
import { TeachingSchedule } from '../../entities/TeachingSchedule';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(TeachingSchedule)
    private teachingSchedulesRepository: Repository<TeachingSchedule>,
    private emailService: EmailService,
  ) {}

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification[]> {
    try {
      const {
        userIds,
        sendEmail = true,
        ...notificationData
      } = createNotificationDto;

      // Create notifications for each user
      const notifications = userIds.map((userId) =>
        this.notificationsRepository.create({
          ...notificationData,
          userId: Number(userId),
          isRead: false,
        }),
      );

      // Save all notifications in a single transaction
      const savedNotifications =
        await this.notificationsRepository.save(notifications);

      // Send email notifications if enabled
      if (sendEmail) {
        await this.sendEmailNotifications(savedNotifications, notificationData);
      }

      return savedNotifications;
    } catch (error) {
      throw new Error('Failed to create notifications: ' + error.message);
    }
  }

  async createTeachingScheduleNotification(
    teachingScheduleId: number,
    userIds: string[],
    title: string,
    content: string,
    notificationTime?: Date,
  ): Promise<Notification[]> {
    // Verify teaching schedule exists
    const teachingSchedule = await this.teachingSchedulesRepository.findOne({
      where: { id: teachingScheduleId },
    });

    if (!teachingSchedule) {
      throw new Error(
        `Teaching schedule with ID ${teachingScheduleId} not found`,
      );
    }

    const notificationDto: CreateNotificationDto = {
      userIds,
      title,
      content,
      type: NotificationType.SCHEDULE,
      teachingScheduleId,
      notificationTime,
      sendEmail: true,
    };

    return this.create(notificationDto);
  }

  /**
   * Send email notifications to users
   * @param notifications List of saved notifications
   * @param notificationData Notification data (title, content, type)
   */
  private async sendEmailNotifications(
    notifications: Notification[],
    notificationData: Omit<CreateNotificationDto, 'userIds'>,
  ): Promise<void> {
    try {
      // Get all user IDs from notifications
      const userIds = notifications.map((notification) => notification.userId);

      // Get user emails from database (using findBy instead of deprecated findByIds)
      const users = await this.usersRepository.findBy({
        id: In(userIds),
      });

      // Send emails in parallel
      const emailPromises = users.map(async (user) => {
        if (user.email) {
          const emailContent =
            this.emailService.generateNotificationEmailTemplate(
              notificationData.title,
              notificationData.content,
              notificationData.type,
            );

          return this.emailService
            .sendEmail(user.email, notificationData.title, emailContent)
            .catch((error) => {
              console.error(`Failed to send email to ${user.email}:`, error);
              // Continue with other emails even if one fails
              return null;
            });
        }
        return null;
      });

      // Wait for all emails to be sent
      await Promise.all(emailPromises);
    } catch (error) {
      // Log error but don't throw - notification creation is still successful
      console.error('Error sending email notifications:', error);
    }
  }

  async findAll(): Promise<Notification[]> {
    return await this.notificationsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Notification | null> {
    return await this.notificationsRepository.findOne({ where: { id } });
  }

  async findByUser(userId: number): Promise<Notification[]> {
    return await this.notificationsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: number,
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<Notification | null> {
    await this.notificationsRepository.update(id, updateNotificationDto);
    return this.findOne(id);
  }

  async markAsRead(id: number): Promise<Notification | null> {
    await this.notificationsRepository.update(id, { isRead: true });
    return this.findOne(id);
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationsRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );
  }

  async remove(id: number): Promise<void> {
    await this.notificationsRepository.delete(id);
  }
}
