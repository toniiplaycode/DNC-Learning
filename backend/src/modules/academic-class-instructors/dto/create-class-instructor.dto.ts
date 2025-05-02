import { IsArray, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateClassInstructorDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  classId: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  instructorId?: number;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  instructorIds?: number[];
}
