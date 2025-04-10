import {
  IsInt,
  IsOptional,
  ValidateNested,
  IsArray,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

class ResponseDto {
  @IsInt()
  @Type(() => Number)
  questionId: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  selectedOptionId?: number;
}

export class SubmitQuizDto {
  @IsNumber()
  @IsInt()
  attemptId: number;

  @IsArray()
  @IsNumber({}, { each: true })
  questionIds: number[];

  @IsArray()
  @IsNumber({}, { each: true })
  responses: number[];
}
