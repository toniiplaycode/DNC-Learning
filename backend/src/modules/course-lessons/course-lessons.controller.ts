import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { CourseLessonsService } from './course-lessons.service';
import { CourseLesson } from 'src/entities/CourseLesson';

@Controller('course-lessons')
export class CourseLessonsController {
  constructor(private readonly courseLessonsService: CourseLessonsService) {}

  @Post()
  create(@Body() courseLesson: CourseLesson) {
    return this.courseLessonsService.create(courseLesson);
  }

  @Get()
  findAll() {
    return this.courseLessonsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.courseLessonsService.findOne(id);
  }

  @Get('course/:courseId/quizzes')
  async findQuizzesByCourse(@Param('courseId', ParseIntPipe) courseId: number) {
    return await this.courseLessonsService.findQuizzesByCourse(courseId);
  }

  @Get('course/:courseId/assignments')
  async findAssignmentsByCourse(
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    return await this.courseLessonsService.findAssignmentsByCourse(courseId);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updatedCourseLesson: Partial<CourseLesson>,
  ) {
    return this.courseLessonsService.update(id, updatedCourseLesson);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.courseLessonsService.remove(id);
  }
}
