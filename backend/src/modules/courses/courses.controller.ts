import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { Course } from 'src/entities/Course';
import CreateCoursesDto from './dto/create-courses.dto';
import UpdateCourseDto from './dto/update-course.dto';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}
  @Get()
  findAll(): Promise<Course[]> {
    return this.coursesService.findAll();
  }
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Course | null> {
    return this.coursesService.findOne(+id);
  }
  @Post()
  create(@Body() course: CreateCoursesDto): Promise<Course> {
    return this.coursesService.create(course);
  }
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() course: UpdateCourseDto,
  ): Promise<Course | null> {
    return this.coursesService.update(+id, course);
  }
  @Delete(':id')
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.coursesService.remove(+id);
  }
}
