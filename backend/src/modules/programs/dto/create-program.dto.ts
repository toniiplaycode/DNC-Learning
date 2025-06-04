import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  Min,
  MaxLength,
} from 'class-validator';
import { ProgramStatus } from '../../../entities/Program';

export class CreateProgramDto {
  @IsNumber()
  majorId: number;

  @IsString()
  @MaxLength(50)
  programCode: string;

  @IsString()
  @MaxLength(255)
  programName: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  totalCredits: number;

  @IsNumber()
  @Min(1)
  durationYears: number;

  @IsEnum(ProgramStatus)
  @IsOptional()
  status?: ProgramStatus;
}
