import {
  Controller,
  Get,
  Param,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('user/:userId')
  async getUserMessages(@Param('userId') userId: string) {
    const parsedUserId = Number(userId);

    if (isNaN(parsedUserId)) {
      throw new BadRequestException('Invalid user ID');
    }

    return this.messagesService.findUserMessages(parsedUserId);
  }
}
