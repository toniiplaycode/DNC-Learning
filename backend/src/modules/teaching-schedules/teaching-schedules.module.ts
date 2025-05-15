import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeachingSchedulesController } from './teaching-schedules.controller';
import { TeachingSchedulesService } from './teaching-schedules.service';
import { TeachingSchedule } from '../../entities/TeachingSchedule';
import { AcademicClass } from '../../entities/AcademicClass';
import { AcademicClassInstructor } from '../../entities/AcademicClassInstructor';
import { AcademicClassCourse } from '../../entities/AcademicClassCourse';
import { UserInstructor } from '../../entities/UserInstructor';
import { NotificationsModule } from '../notifications/notifications.module';
import { UserStudentAcademic } from '../../entities/UserStudentAcademic';
import { SessionAttendance } from 'src/entities/SessionAttendance';
import { User } from 'src/entities/User';
import { UserStudent } from 'src/entities/UserStudent';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TeachingSchedule,
      AcademicClass,
      AcademicClassInstructor,
      AcademicClassCourse,
      UserInstructor,
      UserStudentAcademic,
      SessionAttendance,
      UserStudent,
      User,
    ]),
    NotificationsModule,
  ],
  controllers: [TeachingSchedulesController],
  providers: [TeachingSchedulesService],
  exports: [TeachingSchedulesService],
})
export class TeachingSchedulesModule {}
