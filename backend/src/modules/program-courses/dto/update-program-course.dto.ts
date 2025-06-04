import { PartialType } from '@nestjs/mapped-types';
import { CreateProgramCourseDto } from './create-program-course.dto';

export class UpdateProgramCourseDto extends PartialType(
  CreateProgramCourseDto,
) {}
