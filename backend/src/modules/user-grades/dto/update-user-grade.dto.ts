import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserGradeDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  score?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  maxScore?: number;

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
