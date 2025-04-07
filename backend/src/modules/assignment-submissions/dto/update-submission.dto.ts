import { IsNumber, IsOptional, IsString, IsEnum } from 'class-validator';
import { SubmissionStatus } from '../../../entities/AssignmentSubmission';
import { Type } from 'class-transformer';

export class UpdateSubmissionDto {
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
