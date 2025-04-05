import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnrollmentsController } from './enrollments.controller';
import { EnrollmentsService } from './enrollments.service';
import { Enrollment } from '../../entities/Enrollment';
import { Course } from '../../entities/Course';
import { User } from '../../entities/User';
import { CourseProgress } from '../../entities/CourseProgress';
import { CourseLesson } from '../../entities/CourseLesson';
import { CourseSection } from '../../entities/CourseSection';
import { CoursesModule } from '../courses/courses.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Enrollment,
      Course,
      User,
      CourseProgress,
      CourseLesson,
      CourseSection,
    ]),
    CoursesModule,
    UsersModule,
  ],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService],
  exports: [EnrollmentsService],
})
export class EnrollmentsModule {}
