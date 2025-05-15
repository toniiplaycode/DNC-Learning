import { AttendanceStatus } from '../../../entities/SessionAttendance';
import { Exclude, Expose, Type } from 'class-transformer';

class TeachingScheduleDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  startTime: Date;

  @Expose()
  endTime: Date;
}

class UserDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  fullName: string;

  @Expose()
  avatarUrl: string;
}

class StudentAcademicDto {
  @Expose()
  id: number;

  @Expose()
  studentId: number;

  @Expose()
  fullName: string;

  @Expose()
  avatarUrl: string;

  @Expose()
  @Type(() => UserDto)
  user: UserDto;
}

export class ResponseSessionAttendanceDto {
  @Expose()
  id: number;

  @Expose()
  scheduleId: number;

  @Expose()
  studentAcademicId: number;

  @Expose()
  status: AttendanceStatus;

  @Expose()
  joinTime: Date;

  @Expose()
  leaveTime: Date;

  @Expose()
  durationMinutes: number;

  @Expose()
  notes: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => TeachingScheduleDto)
  teachingSchedule?: TeachingScheduleDto;

  @Expose()
  @Type(() => StudentAcademicDto)
  studentAcademic?: StudentAcademicDto;

  constructor(partial: Partial<ResponseSessionAttendanceDto>) {
    Object.assign(this, partial);
  }
}
