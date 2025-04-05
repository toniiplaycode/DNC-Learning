import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsDate,
  Min,
  Max,
} from 'class-validator';
import { EnrollmentStatus } from '../../../entities/Enrollment';
import { Type } from 'class-transformer';

export class UpdateEnrollmentDto {
  @IsEnum(EnrollmentStatus)
  @IsOptional()
  status?: EnrollmentStatus;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  completionDate?: Date;
}
