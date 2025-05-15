import { IsEnum, IsInt, IsOptional, IsDate, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceStatus } from '../../../entities/SessionAttendance';

export class CreateSessionAttendanceDto {
  @IsInt()
  scheduleId: number;

  @IsInt()
  studentAcademicId: number;

  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  joinTime?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  leaveTime?: Date;

  @IsOptional()
  @IsInt()
  durationMinutes?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
