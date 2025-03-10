import {
  IsNumber,
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

  @IsString()
  @Length(5, 255, { message: 'Title must be between 5 and 255 characters' })
  title: string;
}
