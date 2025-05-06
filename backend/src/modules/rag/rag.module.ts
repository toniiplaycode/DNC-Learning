import { Module } from '@nestjs/common';
import { RagService } from './rag.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatbotResponse } from '../../entities/ChatbotResponse';
import { RagCommand } from './rag.command';
import { OpenAIModule } from '../openai/openai.module';
import { RagController } from './rag.controller';
import { Course } from '../../entities/Course';
import { Document } from '../../entities/Document';
import { Forum } from '../../entities/Forum';
import { Category } from '../../entities/Category';
import { CourseSection } from '../../entities/CourseSection';
import { CourseLesson } from '../../entities/CourseLesson';
import { Quiz } from '../../entities/Quiz';
import { Assignment } from '../../entities/Assignment';
import { AcademicClass } from '../../entities/AcademicClass';
import { UserInstructor } from '../../entities/UserInstructor';
import { User } from '../../entities/User';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      ChatbotResponse,
      Course,
      Document,
      Forum,
      Category,
      CourseSection,
      CourseLesson,
      Quiz,
      Assignment,
      AcademicClass,
      UserInstructor,
      User,
    ]),
    OpenAIModule,
  ],
  controllers: [RagController],
  providers: [RagService, RagCommand],
  exports: [RagService],
})
export class RagModule {}
