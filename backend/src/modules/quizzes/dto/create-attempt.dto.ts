import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAttemptDto {
  @IsInt()
  @Type(() => Number)
  quizId: number;
}
