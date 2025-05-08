import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsDate,
} from 'class-validator';
import { PaymentMethod, PaymentStatus } from '../../../entities/Payment';
import { Type } from 'class-transformer';

export class UpdatePaymentDto {
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  paymentDate?: Date;
}
