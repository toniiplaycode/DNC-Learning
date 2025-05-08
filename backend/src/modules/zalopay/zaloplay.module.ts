import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '../../entities/Payment';
import { ZalopayController } from './zaloplay.controller';
import { ZalopayService } from './zaloplay.service';

@Module({
  imports: [TypeOrmModule.forFeature([Payment])],
  controllers: [ZalopayController],
  providers: [ZalopayService],
  exports: [ZalopayService],
})
export class ZalopayModule {}
