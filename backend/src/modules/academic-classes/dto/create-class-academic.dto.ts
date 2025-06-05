import { IsString, IsEnum, IsInt, Length, Matches, Min } from 'class-validator';
import { AcademicClassStatus } from '../../../entities/AcademicClass';

export class CreateAcademicClassDto {
  @IsString()
  @Length(1, 50)
  classCode: string;

  @IsString()
  @Length(1, 255)
  className: string;

  @IsInt()
  @Min(1)
  majorId: number;

  @IsInt()
  @Min(1)
  programId: number;

  @IsString()
  @Length(5, 20)
  @Matches(/^\d{5}$/, { message: 'Semester must be in format YYYYN' })
  semester: string;

  @IsEnum(AcademicClassStatus)
  status: AcademicClassStatus;
}
