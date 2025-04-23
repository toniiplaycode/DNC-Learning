import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicClassCourse } from '../../entities/AcademicClassCourse';
import { AcademicClassCoursesService } from './academic-class-courses.service';
import { AcademicClassCoursesController } from './academic-class-courses.controller';
import { AcademicClass } from 'src/entities/AcademicClass';
import { UserInstructor } from 'src/entities/UserInstructor';
import { Course } from 'src/entities/Course';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AcademicClassCourse,
      AcademicClass,
      UserInstructor,
      Course,
    ]),
  ],
  providers: [AcademicClassCoursesService],
  controllers: [AcademicClassCoursesController],
  exports: [AcademicClassCoursesService],
})
export class AcademicClassCoursesModule {}
