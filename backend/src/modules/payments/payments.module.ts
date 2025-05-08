import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Payment } from '../../entities/Payment';
import { User } from '../../entities/User';
import { Course } from '../../entities/Course';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, User, Course])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
