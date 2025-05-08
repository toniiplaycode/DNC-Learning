import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ZalopayService } from './zaloplay.service';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('zalopay')
export class ZalopayController {
  constructor(private readonly zalopayService: ZalopayService) {}

  @Post('create-order')
  @UseGuards(JwtAuthGuard)
  async createOrder(
    @Body()
    orderData: {
      courseId: number;
      amount: number;
      description: string;
    },
    @GetUser() user,
  ) {
    const userId = user?.id;
    return this.zalopayService.createOrder(
      userId,
      orderData.courseId,
      orderData.amount,
      orderData.description,
    );
  }

  @Post('callback')
  async handleCallback(@Body() callbackData: any) {
    return this.zalopayService.verifyCallback(callbackData);
  }

  @Get('status/:appTransId')
  @UseGuards(JwtAuthGuard)
  async getTransactionStatus(@Param('appTransId') appTransId: string) {
    return this.zalopayService.getTransactionStatus(appTransId);
  }
}
