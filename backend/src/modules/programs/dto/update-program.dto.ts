import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  Min,
  MaxLength,
} from 'class-validator';
import { ProgramStatus } from '../../../entities/Program';

export class UpdateProgramDto {
  @IsNumber()
  @IsOptional()
  majorId?: number;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  programCode?: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  programName?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  totalCredits?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  durationYears?: number;

  @IsEnum(ProgramStatus)
  @IsOptional()
  status?: ProgramStatus;
}
