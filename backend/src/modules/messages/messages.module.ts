import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { Message } from 'src/entities/Message';
import { MessagesController } from './messages.controller';
import { User } from 'src/entities/User';
import { UserInstructor } from 'src/entities/UserInstructor';
import { UserStudent } from 'src/entities/UserStudent';
import { UserStudentAcademic } from 'src/entities/UserStudentAcademic';
import { WsJwtAuthGuard } from 'src/guards/ws-jwt.guard';
import { ChatbotResponse } from '../../entities/ChatbotResponse';
import { ChatbotService } from '../chatbot-response/chatbot-response.service';
import { RagModule } from '../rag/rag.module';
import { ChatbotResponseModule } from '../chatbot-response/chatbot-response.module';

@Module({
  controllers: [MessagesController],
  imports: [
    TypeOrmModule.forFeature([
      Message,
      User,
      UserStudent,
      UserInstructor,
      UserStudentAcademic,
      ChatbotResponse,
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    RagModule,
    ChatbotResponseModule,
  ],
  providers: [MessagesService, MessagesGateway, WsJwtAuthGuard, ChatbotService],
  exports: [MessagesService],
})
export class MessagesModule {}
