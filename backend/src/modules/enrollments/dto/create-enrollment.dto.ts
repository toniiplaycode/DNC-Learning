import { IsNumber, IsEnum, IsOptional, Min, Max } from 'class-validator';
import { EnrollmentStatus } from '../../../entities/Enrollment';

export class CreateEnrollmentDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  courseId: number;

  @IsEnum(EnrollmentStatus)
  @IsOptional()
  status?: EnrollmentStatus;
}
