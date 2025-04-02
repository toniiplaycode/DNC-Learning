import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseLessonDiscussionsController } from './course-lesson-discussions.controller';
import { CourseLessonDiscussionsService } from './course-lesson-discussions.service';
import { CourseLessonDiscussion } from '../../entities/CourseLessonDiscussion';
import { CourseLesson } from '../../entities/CourseLesson';
import { User } from '../../entities/User';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseLessonDiscussion, CourseLesson, User]),
  ],
  controllers: [CourseLessonDiscussionsController],
  providers: [CourseLessonDiscussionsService],
  exports: [CourseLessonDiscussionsService],
})
export class CourseLessonDiscussionsModule {}
