import { PartialType } from '@nestjs/mapped-types';
import { CreateUserGradeDto } from './create-user-grade.dto';
import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserGradeDto extends PartialType(CreateUserGradeDto) {
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  score?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  weight?: number;

  @IsString()
  @IsOptional()
  feedback?: string;
}
