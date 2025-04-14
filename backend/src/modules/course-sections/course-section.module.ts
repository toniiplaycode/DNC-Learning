import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from 'src/entities/Course';
import { CourseLesson } from 'src/entities/CourseLesson';
import { CourseSection } from 'src/entities/CourseSection';
import { CourseSectionController } from './course-section.controller';
import { CourseSectionService } from './course-section.service';

@Module({
  imports: [TypeOrmModule.forFeature([CourseSection, Course, CourseLesson])],
  providers: [CourseSectionService],
  controllers: [CourseSectionController],
})
export class CourseSectionModule {}
