import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  IsArray,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionType } from '../../../entities/QuizQuestion';

export class CreateOptionDto {
  @IsString()
  @IsNotEmpty()
  optionText: string;

  @IsBoolean()
  isCorrect: boolean;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  orderNumber?: number;
}

export class CreateQuestionDto {
  @IsInt()
  @Type(() => Number)
  quizId: number;

  @IsString()
  @IsNotEmpty()
  questionText: string;

  @IsEnum(QuestionType)
  questionType: QuestionType;

  @IsString()
  @IsOptional()
  correctExplanation?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  points?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  orderNumber?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOptionDto)
  @IsOptional()
  options?: CreateOptionDto[];
}
