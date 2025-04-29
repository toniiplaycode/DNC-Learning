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
import { AcademicClassCourse } from 'src/entities/AcademicClassCourse';
import { UserStudentAcademic } from 'src/entities/UserStudentAcademic';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Enrollment,
      Course,
      User,
      CourseProgress,
      CourseLesson,
      CourseSection,
      AcademicClassCourse,
      UserStudentAcademic,
    ]),
  ],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService],
  exports: [EnrollmentsService],
})
export class EnrollmentsModule {}
