import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseLessonsService } from './course-lessons.service';
import { CourseLessonsController } from './course-lessons.controller';
import { Course } from 'src/entities/Course';
import { CourseSection } from 'src/entities/CourseSection';
import { CourseLesson } from 'src/entities/CourseLesson';

@Module({
  imports: [TypeOrmModule.forFeature([CourseLesson, Course, CourseSection])],
  providers: [CourseLessonsService],
  controllers: [CourseLessonsController],
  exports: [CourseLessonsService], // Xuất service nếu cần sử dụng ở module khác
})
export class CourseLessonsModule {}
