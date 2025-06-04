import { IsString, IsEnum, IsOptional, Length } from 'class-validator';
import { FacultyStatus } from '../../../entities/Faculty';

export class CreateFacultyDto {
  @IsString()
  @Length(2, 50)
  facultyCode: string;

  @IsString()
  @Length(1, 255)
  facultyName: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(FacultyStatus)
  @IsOptional()
  status?: FacultyStatus = FacultyStatus.ACTIVE;
}
