import { IsNumber, IsOptional, IsString, IsEnum } from 'class-validator';
import { SubmissionStatus } from '../../../entities/AssignmentSubmission';
import { Type } from 'class-transformer';

export class CreateSubmissionDto {
  @IsNumber()
  @Type(() => Number)
  assignmentId: number;

  @IsString()
  @IsOptional()
  submissionText?: string;

  @IsString()
  @IsOptional()
  fileUrl?: string;

  @IsEnum(SubmissionStatus)
  @IsOptional()
  status?: SubmissionStatus;
}
