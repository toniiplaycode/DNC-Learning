import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';
import { CertificateStatus } from '../../../entities/Certificate';

export class CreateCertificateDto {
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  @IsNumber()
  courseId: number;

  @IsOptional()
  @IsString()
  certificateNumber?: string;

  @IsOptional()
  @IsString()
  certificateUrl?: string;

  @IsOptional()
  @IsDateString()
  issueDate?: Date;

  @IsOptional()
  @IsDateString()
  expiryDate?: Date;

  @IsOptional()
  @IsEnum(CertificateStatus)
  status?: CertificateStatus;
}
