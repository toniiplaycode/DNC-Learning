import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  @Type(() => Number)
  rating?: number;

  @IsString()
  @IsOptional()
  reviewText?: string;
}
