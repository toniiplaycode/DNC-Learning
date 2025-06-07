import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgramCourseService } from './program-course.service';
import { ProgramCourseController } from './program-course.controller';
import { ProgramCourse } from '../../entities/ProgramCourse';
import { Program } from '../../entities/Program';
import { Course } from '../../entities/Course';
import { AcademicClass } from '../../entities/AcademicClass';
import { AcademicClassCourse } from 'src/entities/AcademicClassCourse';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProgramCourse,
      Program,
      Course,
      AcademicClass,
      AcademicClassCourse,
    ]),
  ],
  controllers: [ProgramCourseController],
  providers: [ProgramCourseService],
  exports: [ProgramCourseService],
})
export class ProgramCourseModule {}
