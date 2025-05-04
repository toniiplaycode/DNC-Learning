import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseProgress } from '../../entities/CourseProgress';
import { CourseProgressService } from './course-progress.service';
import { CourseProgressController } from './course-progress.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CourseProgress])],
  controllers: [CourseProgressController],
  providers: [CourseProgressService],
  exports: [CourseProgressService],
})
export class CourseProgressModule {}
