import { IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { MajorStatus } from '../../../entities/Major';

export class CreateMajorDto {
  @IsNumber()
  facultyId: number;

  @IsString()
  majorCode: string;

  @IsString()
  majorName: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(MajorStatus)
  @IsOptional()
  status?: MajorStatus = MajorStatus.ACTIVE;
}
