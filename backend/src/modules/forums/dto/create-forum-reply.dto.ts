import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateForumReplyDto {
  @IsNotEmpty()
  @IsNumber()
  forumId: number;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsBoolean()
  isSolution?: boolean = false;
}
