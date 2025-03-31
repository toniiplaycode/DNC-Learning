import {
  IsNumber,
  IsEnum,
  IsOptional,
  IsString,
  Min,
  Max,
  IsPositive,
} from 'class-validator';
import { GradeType } from '../../../entities/UserGrade';
import { Type } from 'class-transformer';

export class CreateUserGradeDto {
  @IsNumber()
  @Type(() => Number)
  userId: number;

  @IsNumber()
  @Type(() => Number)
  courseId: number;

  @IsNumber()
  @Type(() => Number)
  gradedBy: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  lessonId?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  assignmentId?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  quizId?: number;

  @IsEnum(GradeType)
  gradeType: GradeType;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  score: number;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  maxScore: number;

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
