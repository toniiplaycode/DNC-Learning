import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDate,
  Min,
} from 'class-validator';
import { QuizType } from '../../../entities/Quiz';
import { Type } from 'class-transformer';

export class CreateQuizDto {
  @IsInt()
  @Type(() => Number)
  lessonId: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  academicClassId?: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  timeLimit?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  passingScore?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  attemptsAllowed?: number;

  @IsEnum(QuizType)
  @IsOptional()
  quizType?: QuizType;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  startTime?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  endTime?: Date;
}
