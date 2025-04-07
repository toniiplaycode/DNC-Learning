import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserGradesController } from './user-grades.controller';
import { UserGradesService } from './user-grades.service';
import { UserGrade } from '../../entities/UserGrade';
import { User } from '../../entities/User';
import { Course } from '../../entities/Course';
import { UserInstructor } from '../../entities/UserInstructor';
import { CourseLesson } from '../../entities/CourseLesson';
import { QuizAttempt } from '../../entities/QuizAttempt';
import { AssignmentSubmission } from '../../entities/AssignmentSubmission';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserGrade,
      User,
      Course,
      UserInstructor,
      CourseLesson,
      AssignmentSubmission,
      QuizAttempt,
    ]),
  ],
  controllers: [UserGradesController],
  providers: [UserGradesService],
  exports: [UserGradesService],
})
export class UserGradesModule {}
