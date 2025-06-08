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

  @IsInt()
  @Min(1)
  @IsOptional()
  semester?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  practice?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  theory?: number;

  @IsBoolean()
  @IsOptional()
  isMandatory?: boolean;
}
