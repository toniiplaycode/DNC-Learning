import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { Notification } from '../../entities/Notification';
import { User } from '../../entities/User';
import { EmailService } from './services/email.service';
import { ConfigModule } from '@nestjs/config';
import { TeachingSchedule } from '../../entities/TeachingSchedule';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, User, TeachingSchedule]),
    ConfigModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, EmailService],
  exports: [NotificationsService, EmailService],
})
export class NotificationsModule {}
