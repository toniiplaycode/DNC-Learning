import { PartialType } from '@nestjs/mapped-types';
import { CreateUserInstructorDto } from './create-user-instructor.dto';

export class UpdateUserInstructorDto extends PartialType(
  CreateUserInstructorDto,
) {}
