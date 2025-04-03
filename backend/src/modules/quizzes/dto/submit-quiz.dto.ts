import { IsInt, IsOptional, ValidateNested, IsArray } from 'class-validator';
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
  @IsInt()
  @Type(() => Number)
  attemptId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseDto)
  responses: ResponseDto[];
}
