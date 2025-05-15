import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsDateString,
  ValidateIf,
  IsUrl,
  IsJSON,
} from 'class-validator';
import { ScheduleStatus } from '../../../entities/TeachingSchedule';

export class CreateTeachingScheduleDto {
  @IsNotEmpty()
  @IsNumber()
  academicClassId: number;

  @IsNotEmpty()
  @IsNumber()
  academicClassInstructorId: number;

  @IsOptional()
  @IsNumber()
  academicClassCourseId?: number;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsDateString()
  startTime: string;

  @IsNotEmpty()
  @IsDateString()
  endTime: string;

  @IsOptional()
  @IsUrl()
  meetingLink?: string;

  @IsOptional()
  @IsString()
  meetingId?: string;

  @IsOptional()
  @IsString()
  meetingPassword?: string;

  @IsOptional()
  @IsEnum(ScheduleStatus)
  status?: ScheduleStatus = ScheduleStatus.SCHEDULED;

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean = false;

  @IsOptional()
  @ValidateIf((o) => o.isRecurring === true)
  @IsJSON()
  recurringPattern?: string;

  @IsOptional()
  @IsUrl()
  recordingUrl?: string;

  @IsOptional()
  @IsDateString()
  notificationTime?: string;
}
