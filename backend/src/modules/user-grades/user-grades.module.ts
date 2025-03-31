import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserGradesController } from './user-grades.controller';
import { UserGrade } from '../../entities/UserGrade';
import { User } from '../../entities/User';
import { Course } from '../../entities/Course';
import { UserInstructor } from '../../entities/UserInstructor';
import { CourseLesson } from '../../entities/CourseLesson';
import { Assignment } from '../../entities/Assignment';
import { Quiz } from '../../entities/Quiz';
import { UserGradesService } from './user-grades.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserGrade,
      User,
      Course,
      UserInstructor,
      CourseLesson,
      Assignment,
      Quiz,
    ]),
  ],
  controllers: [UserGradesController],
  providers: [UserGradesService],
  exports: [UserGradesService],
})
export class UserGradesModule {}
