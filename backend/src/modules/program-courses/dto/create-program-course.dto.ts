import {
  IsInt,
  IsBoolean,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';

export class CreateProgramCourseDto {
  @IsInt()
  @Min(1)
  programId: number;

  @IsInt()
  @Min(1)
  courseId: number;

  @IsInt()
  @Min(1)
  @Max(10)
  credits: number;

  @IsBoolean()
  @IsOptional()
  isMandatory?: boolean;
}
