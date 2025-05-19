import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  IsArray,
  ArrayMinSize,
} from 'class-validator';
import { CertificateStatus } from '../../../entities/Certificate';

export class CreateMultipleCertificatesDto {
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  userIds: number[];

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
