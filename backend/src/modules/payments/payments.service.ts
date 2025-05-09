import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from '../../entities/Payment';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
  ) {}

  async create(
    createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentResponseDto> {
    // Check if a payment with the same transactionId already exists
    if (createPaymentDto.transactionId) {
      const existingPayment = await this.paymentsRepository.findOne({
        where: { transactionId: createPaymentDto.transactionId },
      });

      if (existingPayment) {
        // Update the existing payment instead of creating a new one
        const updatedPayment = {
          ...existingPayment,
          ...createPaymentDto,
          // If the payment is being updated to completed, set payment date
          paymentDate:
            createPaymentDto.status === PaymentStatus.COMPLETED &&
            !existingPayment.paymentDate
              ? new Date()
              : existingPayment.paymentDate,
        };

        const savedPayment = await this.paymentsRepository.save(updatedPayment);
        return plainToInstance(PaymentResponseDto, savedPayment, {
          excludeExtraneousValues: true,
        });
      }
    }

    // If no existing payment found or no transactionId provided, create a new one
    const payment = this.paymentsRepository.create(createPaymentDto);
    const savedPayment = await this.paymentsRepository.save(payment);
    return plainToInstance(PaymentResponseDto, savedPayment, {
      excludeExtraneousValues: true,
    });
  }

  async findAll(): Promise<any[]> {
    const payments = await this.paymentsRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.course', 'course')
      .leftJoinAndSelect('course.instructor', 'instructor')
      .leftJoinAndSelect('payment.user', 'user')
      .orderBy('payment.createdAt', 'DESC')
      .getMany();

    return plainToInstance(PaymentResponseDto, payments, {
      excludeExtraneousValues: true,
    });
  }

  async findOne(id: number): Promise<PaymentResponseDto> {
    const payment = await this.paymentsRepository.findOne({
      where: { id },
      relations: ['user', 'course'],
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return plainToInstance(PaymentResponseDto, payment, {
      excludeExtraneousValues: true,
    });
  }

  async update(
    id: number,
    updatePaymentDto: UpdatePaymentDto,
  ): Promise<PaymentResponseDto> {
    const payment = await this.findOneEntity(id);

    // If status is being updated to completed, set payment date
    if (
      updatePaymentDto.status === PaymentStatus.COMPLETED &&
      !payment.paymentDate
    ) {
      updatePaymentDto.paymentDate = new Date();
    }

    const updatedPayment = {
      ...payment,
      ...updatePaymentDto,
    };

    const savedPayment = await this.paymentsRepository.save(updatedPayment);
    return plainToInstance(PaymentResponseDto, savedPayment, {
      excludeExtraneousValues: true,
    });
  }

  async remove(id: number): Promise<void> {
    const payment = await this.findOneEntity(id);
    await this.paymentsRepository.remove(payment);
  }

  async findByUser(userId: number): Promise<PaymentResponseDto[]> {
    const payments = await this.paymentsRepository.find({
      where: { userId },
      relations: ['course'],
    });
    return plainToInstance(PaymentResponseDto, payments, {
      excludeExtraneousValues: true,
    });
  }

  async findByInstructor(instructorId: number): Promise<PaymentResponseDto[]> {
    // Use a query builder to join with the course table and filter by instructor
    const payments = await this.paymentsRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.course', 'course')
      .leftJoinAndSelect('payment.user', 'user')
      .where('course.instructorId = :instructorId', { instructorId })
      .orderBy('payment.createdAt', 'DESC')
      .getMany();

    return plainToInstance(PaymentResponseDto, payments, {
      excludeExtraneousValues: true,
    });
  }

  async findByCourse(courseId: number): Promise<PaymentResponseDto[]> {
    const payments = await this.paymentsRepository.find({
      where: { courseId },
      relations: ['user'],
    });
    return plainToInstance(PaymentResponseDto, payments, {
      excludeExtraneousValues: true,
    });
  }

  async findByStatus(status: PaymentStatus): Promise<PaymentResponseDto[]> {
    const payments = await this.paymentsRepository.find({
      where: { status },
      relations: ['user', 'course'],
    });
    return plainToInstance(PaymentResponseDto, payments, {
      excludeExtraneousValues: true,
    });
  }

  // Helper method to get the entity without transformation
  private async findOneEntity(id: number): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { id },
      relations: ['user', 'course'],
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }
}
