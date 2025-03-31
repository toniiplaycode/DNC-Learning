import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyCertificateDto {
  @IsString()
  @IsNotEmpty()
  certificateNumber: string;
}
