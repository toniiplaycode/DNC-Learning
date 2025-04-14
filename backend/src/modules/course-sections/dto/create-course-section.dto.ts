import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCourseSectionDto {
  @IsInt()
  courseId: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  orderNumber: number;
}
