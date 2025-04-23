import { IsNumber, IsNotEmpty } from 'class-validator';

export class CreateAcademicClassCourseDto {
  @IsNotEmpty()
  @IsNumber()
  classId: number;

  @IsNotEmpty()
  @IsNumber()
  courseId: number;
}
