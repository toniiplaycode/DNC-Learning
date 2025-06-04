import {
  IsString,
  IsEnum,
  IsOptional,
  Length,
  IsNumber,
} from 'class-validator';
import { MajorStatus } from '../../../entities/Major';

export class CreateMajorDto {
  @IsNumber()
  facultyId: number;

  @IsString()
  @Length(2, 50)
  majorCode: string;

  @IsString()
  @Length(1, 255)
  majorName: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(MajorStatus)
  @IsOptional()
  status?: MajorStatus = MajorStatus.ACTIVE;
}
