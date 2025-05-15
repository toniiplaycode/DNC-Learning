import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsNumber,
  Min,
  Max,
  IsDateString,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';

export enum FrequencyType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export class RecurringPatternDto {
  @IsNotEmpty()
  @IsEnum(FrequencyType)
  frequency: FrequencyType;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  @Max(7, { each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(7)
  days?: number[]; // 1-7 for Monday-Sunday

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(12)
  interval: number; // Repeat every X days/weeks/months

  @IsNotEmpty()
  @IsDateString()
  until: string; // Date until which the pattern repeats
}
