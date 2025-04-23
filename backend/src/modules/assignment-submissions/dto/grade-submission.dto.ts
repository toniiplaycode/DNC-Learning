import { IsNumber, IsOptional, IsString, IsEnum } from 'class-validator';
import { SubmissionStatus } from '../../../entities/AssignmentSubmission';
import { Type } from 'class-transformer';

export class GradeSubmissionDto {
  @IsNumber()
  @Type(() => Number)
  score: number;

  @IsNumber()
  @Type(() => Number)
  weight: number;

  @IsNumber()
  @Type(() => Number)
  instructorId: number;

  @IsString()
  @IsOptional()
  feedback?: string;

  @IsEnum(SubmissionStatus)
  @IsOptional()
  status?: SubmissionStatus;
}
