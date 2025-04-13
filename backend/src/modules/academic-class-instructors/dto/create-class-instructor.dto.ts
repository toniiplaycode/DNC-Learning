import { IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateClassInstructorDto {
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  classId: number;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  instructorId: number;
}
