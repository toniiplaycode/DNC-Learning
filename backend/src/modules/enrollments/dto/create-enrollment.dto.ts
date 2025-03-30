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

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  progress?: number;
}
