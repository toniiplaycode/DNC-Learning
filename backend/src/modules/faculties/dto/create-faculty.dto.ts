import { IsString, IsEnum, IsOptional } from 'class-validator';
import { FacultyStatus } from '../../../entities/Faculty';

export class CreateFacultyDto {
  @IsString()
  facultyCode: string;

  @IsString()
  facultyName: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(FacultyStatus)
  @IsOptional()
  status?: FacultyStatus = FacultyStatus.ACTIVE;
}
