import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { PaymentMethod, PaymentStatus } from '../../../entities/Payment';

export class UserDto {
  @Expose()
  id: number;

  @Expose()
  username: string;

  @Expose()
  email: string;
}

export class CourseDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  price: number;

  @Expose()
  thumbnailUrl: string;
}

export class PaymentResponseDto {
  @Expose()
  id: number;

  @Expose()
  userId: number;

  @Expose()
  courseId: number;

  @Expose()
  amount: number;

  @Expose()
  paymentMethod: PaymentMethod;

  @Expose()
  transactionId: string | null;

  @Expose()
  status: PaymentStatus;

  @Expose()
  @Transform(({ value }) => (value ? new Date(value).toISOString() : null))
  paymentDate: Date | null;

  @Expose()
  @Transform(({ value }) => new Date(value).toISOString())
  createdAt: Date;

  @Expose()
  @Type(() => UserDto)
  user: UserDto;

  @Expose()
  @Type(() => CourseDto)
  course: CourseDto;
}
