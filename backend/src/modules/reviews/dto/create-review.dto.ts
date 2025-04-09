import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ReviewType } from '../../../entities/Review';
import { Type } from 'class-transformer';

export class CreateReviewDto {
  @IsInt()
  @Type(() => Number)
  userStudentId: number;

  @IsInt()
  @Type(() => Number)
  courseId: number;

  @IsEnum(ReviewType)
  reviewType: ReviewType;

  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  rating: number;

  @IsString()
  @IsOptional()
  reviewText?: string;
}
