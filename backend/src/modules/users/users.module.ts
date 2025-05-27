import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers & Services
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

// Entities
import { User } from 'src/entities/User';
import { UserStudent } from 'src/entities/UserStudent';
import { UserInstructor } from 'src/entities/UserInstructor';
import { UserStudentAcademic } from 'src/entities/UserStudentAcademic';
import { AcademicClass } from 'src/entities/AcademicClass';
import { AcademicClassCourse } from 'src/entities/AcademicClassCourse';
import { AcademicClassInstructor } from 'src/entities/AcademicClassInstructor';
import { AssignmentSubmission } from 'src/entities/AssignmentSubmission';
import { UserGrade } from 'src/entities/UserGrade';
import { CourseLesson } from 'src/entities/CourseLesson';
import { Assignment } from 'src/entities/Assignment';
import { QuizAttempt } from 'src/entities/QuizAttempt';
import { Quiz } from 'src/entities/Quiz';
import { Course } from 'src/entities/Course';
import { Enrollment } from 'src/entities/Enrollment';
import { Category } from 'src/entities/Category';
import { Notification } from 'src/entities/Notification';
import { TeachingSchedule } from 'src/entities/TeachingSchedule';
import { SessionAttendance } from 'src/entities/SessionAttendance';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserStudent,
      UserInstructor,
      UserStudentAcademic,
      AcademicClass,
      AcademicClassCourse,
      AcademicClassInstructor,
      UserGrade,
      CourseLesson,
      AssignmentSubmission,
      Assignment,
      QuizAttempt,
      Quiz,
      Course,
      Enrollment,
      Category,
      Notification,
      TeachingSchedule,
      SessionAttendance,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
