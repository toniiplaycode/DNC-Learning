import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Min,
  Validate,
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
  @Validate(isUppercase, { message: 'Title must be uppercase' })
  title: string;

  @IsNotEmpty()
  @IsString()
  @Length(5, 255, { message: 'Slug must be between 5 and 255 characters' })
  slug: string;

  @IsNotEmpty()
  @IsString()
  @Length(5, 255, {
    message: 'Description must be between 5 and 255 characters',
  })
  description: string;

  @IsNumber()
  price: number;

  @IsNumber()
  @Min(1, { message: 'Duration must be greater than 1' })
  duration: number;

  @IsString()
  @IsIn(['beginner', 'intermediate', 'advanced'], {
    message: 'Level must be one of: beginner, intermediate, advanced',
  })
  level: string;
}
