import { IsEnum, IsInt, IsOptional, IsDate, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceStatus } from '../../../entities/SessionAttendance';
import { PartialType } from '@nestjs/mapped-types';
import { CreateSessionAttendanceDto } from './create-session-attendance.dto';

export class UpdateSessionAttendanceDto extends PartialType(
  CreateSessionAttendanceDto,
) {}
