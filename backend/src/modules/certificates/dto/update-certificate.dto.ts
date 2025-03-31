import { PartialType } from '@nestjs/mapped-types';
import { CreateCertificateDto } from './create-certificate.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CertificateStatus } from '../../../entities/Certificate';

export class UpdateCertificateDto extends PartialType(CreateCertificateDto) {
  @IsString()
  @IsOptional()
  certificateUrl?: string;

  @IsEnum(CertificateStatus)
  @IsOptional()
  status?: CertificateStatus;
}
