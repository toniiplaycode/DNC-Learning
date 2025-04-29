import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../entities/Notification';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification[]> {
    try {
      const { userIds, ...notificationData } = createNotificationDto;

      // Create notifications for each user
      const notifications = userIds.map((userId) =>
        this.notificationsRepository.create({
          ...notificationData,
          userId: Number(userId),
          isRead: false,
        }),
      );

      // Save all notifications in a single transaction
      return await this.notificationsRepository.save(notifications);
    } catch (error) {
      throw new Error('Failed to create notifications: ' + error.message);
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
