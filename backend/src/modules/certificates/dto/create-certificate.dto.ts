import {
  IsNumber,
  IsEnum,
  IsOptional,
  IsString,
  IsDate,
} from 'class-validator';
import { CertificateStatus } from '../../../entities/Certificate';
import { Type } from 'class-transformer';

export class CreateCertificateDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  courseId: number;

  @IsString()
  @IsOptional()
  certificateNumber?: string;

  @IsString()
  @IsOptional()
  certificateUrl?: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  issueDate?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  expiryDate?: Date;

  @IsEnum(CertificateStatus)
  @IsOptional()
  status?: CertificateStatus;
}
