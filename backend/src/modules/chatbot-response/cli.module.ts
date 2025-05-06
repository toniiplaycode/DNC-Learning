import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatbotResponse } from '../../entities/ChatbotResponse';
import { Course } from '../../entities/Course';
import { UserInstructor } from '../../entities/UserInstructor';
import { AnalyzeChatbotDataCommand } from '../chatbot-response/chatbot-analyzer.command';
import { ChatbotAnalyzerService } from '../chatbot-response/chatbot-analyzer.service';
import { Review } from 'src/entities/Review';
import { Quiz } from 'src/entities/Quiz';
import { Assignment } from 'src/entities/Assignment';
import { Certificate } from 'src/entities/Certificate';
import { Enrollment } from 'src/entities/Enrollment';
import { Forum } from 'src/entities/Forum';
import { Category } from 'src/entities/Category';
import { Document } from 'src/entities/Document';
import { RagClearCommand, RagCommand } from '../rag/rag.command';
import { RagModule } from '../rag/rag.module';
import { CourseSection } from '../../entities/CourseSection';
import { CourseLesson } from '../../entities/CourseLesson';
import { AcademicClass } from '../../entities/AcademicClass';
import { User } from '../../entities/User';
import { UserStudent } from '../../entities/UserStudent';
import { UserGrade } from '../../entities/UserGrade';
import { QuizAttempt } from '../../entities/QuizAttempt';
import { QuizQuestion } from '../../entities/QuizQuestion';
import { QuizOption } from '../../entities/QuizOption';
import { QuizResponse } from '../../entities/QuizResponse';
import { AssignmentSubmission } from '../../entities/AssignmentSubmission';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatbotResponse,
      Course,
      UserInstructor,
      Review,
      Quiz,
      Assignment,
      Certificate,
      Enrollment,
      Forum,
      Document,
      Category,
      CourseSection,
      CourseLesson,
      AcademicClass,
      User,
      UserStudent,
      UserGrade,
      QuizAttempt,
      QuizQuestion,
      QuizOption,
      QuizResponse,
      AssignmentSubmission,
      CourseSection,
      CourseLesson,
      AcademicClass,
      User,
      UserStudent,
      UserGrade,
      QuizAttempt,
    ]),
    RagModule,
  ],
  providers: [
    ChatbotAnalyzerService,
    AnalyzeChatbotDataCommand,
    RagClearCommand,
    RagCommand,
  ],
})
export class CliModule {}
