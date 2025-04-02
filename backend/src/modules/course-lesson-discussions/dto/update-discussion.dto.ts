import { IsOptional, IsString, IsEnum } from 'class-validator';
import { DiscussionStatus } from '../../../entities/CourseLessonDiscussion';

export class UpdateDiscussionDto {
  @IsString()
  @IsOptional()
  content?: string;

  @IsEnum(DiscussionStatus)
  @IsOptional()
  status?: DiscussionStatus;
}
