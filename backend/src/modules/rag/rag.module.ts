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
import { Review } from 'src/entities/Review';
import { UserStudent } from 'src/entities/UserStudent';
import { Enrollment } from 'src/entities/Enrollment';
import { QuizAttempt } from 'src/entities/QuizAttempt';
import { UserGrade } from 'src/entities/UserGrade';
import { QuizQuestion } from 'src/entities/QuizQuestion';
import { AssignmentSubmission } from 'src/entities/AssignmentSubmission';
import { Certificate } from 'src/entities/Certificate';
import { QuizResponse } from 'src/entities/QuizResponse';
import { QuizOption } from 'src/entities/QuizOption';
import { Faculty } from 'src/entities/Faculty';
import { Major } from 'src/entities/Major';
import { Program } from 'src/entities/Program';
import { ProgramCourse } from 'src/entities/ProgramCourse';

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
      UserStudent,
      UserGrade,
      Review,
      Enrollment,
      QuizAttempt,
      QuizQuestion,
      QuizOption,
      QuizResponse,
      AssignmentSubmission,
      Certificate,
      Faculty,
      Major,
      Program,
      ProgramCourse,
    ]),
    OpenAIModule,
  ],
  controllers: [RagController],
  providers: [RagService, RagCommand],
  exports: [RagService],
})
export class RagModule {}
