import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Quiz,
      QuizQuestion,
      QuizOption,
      QuizAttempt,
      QuizResponse,
      CourseLesson,
      User,
    ]),
    UserGradesModule,
  ],
  controllers: [QuizzesController],
  providers: [QuizzesService],
  exports: [QuizzesService],
})
export class QuizzesModule {}
