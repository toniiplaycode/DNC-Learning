import { IsBoolean, IsEmail, IsOptional } from 'class-validator';
import { NotificationType } from '../../../entities/Notification';

export class NotificationEmailDto {
  @IsEmail()
  email: string;

  title: string;

  content: string;

  type: NotificationType;

  @IsOptional()
  @IsBoolean()
  sendEmail?: boolean = true;
}
