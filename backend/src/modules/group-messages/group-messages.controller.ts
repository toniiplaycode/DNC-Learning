import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { GroupMessagesService } from './group-messages.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('group-messages')
@UseGuards(JwtAuthGuard)
export class GroupMessagesController {
  constructor(private readonly groupMessagesService: GroupMessagesService) {}

  @Get('class/:classId')
  async getMessagesByClass(@Param('classId') classId: string) {
    return this.groupMessagesService.getMessagesByClass(Number(classId));
  }
}
