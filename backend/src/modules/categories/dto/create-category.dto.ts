import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';

export enum CategoryStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(CategoryStatus)
  status?: CategoryStatus = CategoryStatus.ACTIVE;
}
