import { PartialType } from '@nestjs/mapped-types';
import { CreateAcademicClassCourseDto } from './create-academic-class-courses.dto';

export class UpdateAcademicClassCourseDto extends PartialType(
  CreateAcademicClassCourseDto,
) {}
