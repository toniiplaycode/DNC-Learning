import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsEnum,
} from 'class-validator';
import { DiscussionStatus } from '../../../entities/CourseLessonDiscussion';
import { Type } from 'class-transformer';

export class CreateDiscussionDto {
  @IsNumber()
  @Type(() => Number)
  lessonId: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  parentId?: number;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(DiscussionStatus)
  @IsOptional()
  status?: DiscussionStatus;
}
