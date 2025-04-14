import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateCourseSectionDto {
  @IsInt()
  id: number;

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
