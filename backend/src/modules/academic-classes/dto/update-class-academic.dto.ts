import { PartialType } from '@nestjs/mapped-types';
import { CreateAcademicClassDto } from './create-class-academic.dto';

export class UpdateAcademicClassDto extends PartialType(
  CreateAcademicClassDto,
) {}
