import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseProgress } from '../../entities/CourseProgress';
import { CourseLesson } from '../../entities/CourseLesson';
import { User } from '../../entities/User';
import { Course } from '../../entities/Course';
import { CourseSection } from '../../entities/CourseSection';
import { CourseProgressService } from './course-progress.service';
import { CourseProgressController } from './course-progress.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CourseProgress,
      CourseLesson,
      User,
      Course,
      CourseSection,
    ]),
    AuthModule,
  ],
  controllers: [CourseProgressController],
  providers: [CourseProgressService],
  exports: [CourseProgressService],
})
export class CourseProgressModule {}
