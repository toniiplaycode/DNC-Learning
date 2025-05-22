import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { QuizzesController } from './quizzes.controller';
import { QuizzesService } from './quizzes.service';
import { Quiz } from '../../entities/Quiz';
import { QuizQuestion } from '../../entities/QuizQuestion';
import { QuizOption } from '../../entities/QuizOption';
import { QuizAttempt } from '../../entities/QuizAttempt';
import { QuizResponse } from '../../entities/QuizResponse';
import { CourseLesson } from '../../entities/CourseLesson';
import { User } from '../../entities/User';
import { UserGradesModule } from '../user-grades/user-grades.module';
import { QuizAttemptsService } from './quiz-attempts.service';
import { QuizResponsesService } from './quiz-responses.service';
import { Course } from 'src/entities/Course';
import { OpenAIModule } from '../openai/openai.module';
import { AutoQuizGeneratorService } from './auto-quiz-generator.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([
      Quiz,
      QuizQuestion,
      QuizOption,
      QuizAttempt,
      QuizResponse,
      CourseLesson,
      User,
      Course,
    ]),
    UserGradesModule,
    OpenAIModule,
  ],
  controllers: [QuizzesController],
  providers: [
    QuizzesService,
    QuizAttemptsService,
    QuizResponsesService,
    AutoQuizGeneratorService,
  ],
  exports: [
    QuizzesService,
    QuizAttemptsService,
    QuizResponsesService,
    AutoQuizGeneratorService,
  ],
})
export class QuizzesModule {}
