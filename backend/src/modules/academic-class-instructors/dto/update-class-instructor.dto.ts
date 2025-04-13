import { PartialType } from '@nestjs/mapped-types';
import { CreateClassInstructorDto } from './create-class-instructor.dto';

export class UpdateClassInstructorDto extends PartialType(
  CreateClassInstructorDto,
) {}
