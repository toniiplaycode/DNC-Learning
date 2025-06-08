import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
} from 'class-validator';
import { VerificationStatus } from '../../../entities/UserInstructor';

export class CreateUserInstructorDto {
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsOptional()
  @IsNumber()
  facultyId?: number;

  @IsNotEmpty()
  @IsString()
  fullName: string;

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
  paymentInfo?: any;

  @IsOptional()
  @IsEnum(VerificationStatus)
  verificationStatus?: VerificationStatus = VerificationStatus.PENDING;

  @IsOptional()
  @IsString()
  verificationDocuments?: string;
}
