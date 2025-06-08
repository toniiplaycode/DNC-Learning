import { IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';
import { VerificationStatus } from '../../../entities/UserInstructor';

export class UpdateInstructorDto {
  @IsOptional()
  @IsNumber()
  facultyId?: number;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  professionalTitle?: string;

  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsString()
  educationBackground?: string;

  @IsOptional()
  @IsString()
  teachingExperience?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  expertiseAreas?: string;

  @IsOptional()
  @IsString()
  certificates?: string;

  @IsOptional()
  @IsString()
  linkedinProfile?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsEnum(VerificationStatus)
  verificationStatus?: VerificationStatus;
}
