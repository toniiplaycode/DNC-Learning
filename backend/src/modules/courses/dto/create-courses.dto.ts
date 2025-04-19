import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

// custom validator
@ValidatorConstraint()
export class isUppercase implements ValidatorConstraintInterface {
  async validate(value: any) {
    return typeof value === 'string' && value.toUpperCase() === value;
  }
}

export default class CreateCoursesDto {
  @IsNotEmpty()
  @IsString()
  @Length(5, 255, { message: 'Title must be between 5 and 255 characters' })
  title: string;

  @IsNotEmpty()
  @IsString()
  @Length(5, 255, {
    message: 'Description must be between 5 and 255 characters',
  })
  description: string;

  @IsNumber()
  price: number;
}
