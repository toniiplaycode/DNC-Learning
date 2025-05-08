import {
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { NotificationType } from '../../../entities/Notification';

export class CreateNotificationDto {
  @IsArray()
  @IsNotEmpty()
  userIds: string[];

  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  content: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsOptional()
  scheduleId?: number;

  @IsOptional()
  notificationTime?: Date;

  @IsOptional()
  @IsBoolean()
  sendEmail?: boolean = true;
}
