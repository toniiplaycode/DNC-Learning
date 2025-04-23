import { IsNumber, IsEnum, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { GradeType } from '../../../entities/UserGrade';

export class CreateUserGradeDto {
  @IsNumber()
  @Type(() => Number)
  userId: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  courseId?: number;

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
  assignmentSubmissionId?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  assignmentId?: number;

  @IsEnum(GradeType)
  gradeType: GradeType;

  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  score: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxScore: number;

  @IsNumber()
  @Min(0.1)
  @Max(1.0)
  @Type(() => Number)
  weight: number;

  @IsOptional()
  feedback?: string;
}
