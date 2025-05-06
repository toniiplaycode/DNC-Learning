import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatbotResponse } from '../../entities/ChatbotResponse';
import { Message } from '../../entities/Message';
import { ChatbotService } from './chatbot-response.service';
import { RagModule } from '../rag/rag.module';

@Module({
  imports: [TypeOrmModule.forFeature([ChatbotResponse, Message]), RagModule],
  providers: [ChatbotService],
  exports: [ChatbotService],
})
export class ChatbotResponseModule {}
