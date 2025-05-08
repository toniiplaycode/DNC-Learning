import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { Payment, PaymentMethod, PaymentStatus } from '../../entities/Payment';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/User';
import { ZalopayService } from '../zalopay/zaloplay.service';
import { User } from '../../entities/User';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly zalopayService: ZalopayService,
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.create(createPaymentDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  findAll(): Promise<PaymentResponseDto[]> {
    return this.paymentsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number): Promise<PaymentResponseDto> {
    return this.paymentsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.update(id, updatePaymentDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.paymentsService.remove(id);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  findByUser(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<PaymentResponseDto[]> {
    return this.paymentsService.findByUser(userId);
  }

  @Get('course/:courseId')
  @UseGuards(JwtAuthGuard)
  findByCourse(
    @Param('courseId', ParseIntPipe) courseId: number,
  ): Promise<PaymentResponseDto[]> {
    return this.paymentsService.findByCourse(courseId);
  }

  @Get('status/:status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findByStatus(
    @Param('status') status: PaymentStatus,
  ): Promise<PaymentResponseDto[]> {
    return this.paymentsService.findByStatus(status);
  }

  @Post('zalopay')
  @UseGuards(JwtAuthGuard)
  async createZaloPayOrder(
    @Body() data: { courseId: number; amount: number; description: string },
    @GetUser() user: User,
  ) {
    const zaloPayResult = await this.zalopayService.createOrder(
      user.id,
      data.courseId,
      data.amount,
      data.description || `Payment for course #${data.courseId}`,
    );

    return zaloPayResult;
  }

  @Get('zalopay/return')
  async handleZaloPayReturn(@Query() query: any) {
    const { apptransid, status, amount, userId, courseId } = query;
    const transactionStatus =
      await this.zalopayService.getTransactionStatus(apptransid);

    console.log('transactionStatus', transactionStatus);
    console.log('query', query);

    if (status === '1' && transactionStatus.return_code === 1) {
      // Find existing payment by transaction ID
      const payments = await this.paymentsRepository.find({
        where: { transactionId: apptransid },
      });

      if (payments && payments.length > 0) {
        const existingPayment = payments[0];
        // Update payment status if not already completed
        if (existingPayment.status !== PaymentStatus.COMPLETED) {
          await this.paymentsRepository.update(existingPayment.id, {
            status: PaymentStatus.COMPLETED,
            paymentDate: new Date(),
          });
          console.log(`Updated payment ID ${existingPayment.id} to COMPLETED`);
        }
      } else {
        // Create new payment if it doesn't exist
        const userIdNum = parseInt(userId, 10);
        const courseIdNum = parseInt(courseId, 10);
        const amountNum = parseInt(amount, 10);

        const newPayment = await this.paymentsService.create({
          userId: userIdNum,
          courseId: courseIdNum,
          amount: amountNum,
          paymentMethod: PaymentMethod.E_WALLET,
          transactionId: apptransid,
          status: PaymentStatus.COMPLETED,
          paymentDate: new Date(),
        });

        console.log(`Created new payment: ${JSON.stringify(newPayment)}`);
      }

      return { success: true, message: 'Payment successful' };
    }

    return { success: false, message: 'Payment failed or canceled' };
  }
}
