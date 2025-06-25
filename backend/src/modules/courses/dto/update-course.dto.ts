import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint()
export class isUppercase implements ValidatorConstraintInterface {
  async validate(value: any) {
    return typeof value === 'string' && value.toUpperCase() === value;
  }
}
export default class UpdateCourseDto {
  id: number;

  @IsOptional()
  @IsString()
  @Length(1, 255, { message: 'Title must be between 1 and 255 characters' })
  title?: string;

  @IsOptional()
  @IsString()
  @IsIn(['student', 'student_academic', 'both'], {
    message: 'For must be one of: student, student_academic, or both',
  })
  for?: 'student' | 'student_academic' | 'both';
}
