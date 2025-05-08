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
    const payment = this.paymentsRepository.create(createPaymentDto);
    const savedPayment = await this.paymentsRepository.save(payment);
    return plainToInstance(PaymentResponseDto, savedPayment, {
      excludeExtraneousValues: true,
    });
  }

  async findAll(): Promise<PaymentResponseDto[]> {
    const payments = await this.paymentsRepository.find({
      relations: ['user', 'course'],
    });
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
