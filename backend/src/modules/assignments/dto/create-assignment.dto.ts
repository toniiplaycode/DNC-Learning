import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDate,
} from 'class-validator';
import { AssignmentType } from '../../../entities/Assignment';
import { Type } from 'class-transformer';

export class CreateAssignmentDto {
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  lessonId?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  academicClassId?: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  dueDate?: Date;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  maxScore?: number;

  @IsString()
  @IsOptional()
  fileRequirements?: string;

  @IsEnum(AssignmentType)
  @IsOptional()
  assignmentType?: AssignmentType;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  startTime?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  endTime?: Date;
}
