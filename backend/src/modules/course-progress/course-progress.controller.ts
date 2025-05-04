import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CourseProgressService } from './course-progress.service';
import { CourseProgress } from '../../entities/CourseProgress';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('course-progress')
@UseGuards(JwtAuthGuard)
export class CourseProgressController {
  constructor(private readonly courseProgressService: CourseProgressService) {}

  @Post()
  async create(
    @Body('userId') userId: number,
    @Body('lessonId') lessonId: number,
  ): Promise<CourseProgress> {
    console.log(userId, lessonId);
    return this.courseProgressService.create(userId, lessonId);
  }

  @Put(':id/last-accessed')
  async updateLastAccessed(@Param('id') id: number): Promise<CourseProgress> {
    return this.courseProgressService.updateLastAccessed(id);
  }

  @Put(':id/complete')
  async markAsCompleted(@Param('id') id: number): Promise<CourseProgress> {
    return this.courseProgressService.markAsCompleted(id);
  }

  @Get('user/:userId/lesson/:lessonId')
  async findByUserAndLesson(
    @Param('userId') userId: number,
    @Param('lessonId') lessonId: number,
  ): Promise<CourseProgress> {
    return this.courseProgressService.findByUserAndLesson(userId, lessonId);
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: number): Promise<CourseProgress[]> {
    return this.courseProgressService.findByUser(userId);
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<void> {
    return this.courseProgressService.delete(id);
  }
}
