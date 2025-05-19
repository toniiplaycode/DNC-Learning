import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { CourseProgressService } from './course-progress.service';
import { CourseProgress } from '../../entities/CourseProgress';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { User, UserRole } from 'src/entities/User';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

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

  @Get('user-course-progress')
  async getUserCourseProgress(@GetUser() user: User): Promise<any[]> {
    if (!user || !user.id) {
      throw new UnauthorizedException('User not authenticated properly');
    }
    return this.courseProgressService.getUserCourseProgress(user.id);
  }

  @Get('user-course-progress/course/:courseId')
  async getCourseProgressDetail(
    @GetUser() user: User,
    @Param('courseId') courseId: number,
  ): Promise<any> {
    if (!user || !user.id) {
      throw new UnauthorizedException('User not authenticated properly');
    }
    return this.courseProgressService.getCourseProgressDetail(
      user.id,
      courseId,
    );
  }

  @Get('all-progress')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getAllUsersCourseProgress(): Promise<any[]> {
    return this.courseProgressService.getAllUsersCourseProgress();
  }
}
