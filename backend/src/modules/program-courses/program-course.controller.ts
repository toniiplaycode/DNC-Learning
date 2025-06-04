import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ProgramCourseService } from './program-course.service';
import { CreateProgramCourseDto } from './dto/create-program-course.dto';
import { UpdateProgramCourseDto } from './dto/update-program-course.dto';
import { ProgramCourse } from '../../entities/ProgramCourse';

@Controller('program-courses')
export class ProgramCourseController {
  constructor(private readonly programCourseService: ProgramCourseService) {}

  @Post()
  create(@Body() createDto: CreateProgramCourseDto): Promise<ProgramCourse> {
    return this.programCourseService.create(createDto);
  }

  @Get()
  findAll(
    @Query('programId') programId?: number,
    @Query('courseId') courseId?: number,
  ): Promise<ProgramCourse[]> {
    if (programId) {
      return this.programCourseService.findByProgram(programId);
    }
    if (courseId) {
      return this.programCourseService.findByCourse(courseId);
    }
    return this.programCourseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ProgramCourse> {
    return this.programCourseService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateProgramCourseDto,
  ): Promise<ProgramCourse> {
    return this.programCourseService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.programCourseService.remove(id);
  }

  @Delete('program/:programId/course/:courseId')
  removeByProgramAndCourse(
    @Param('programId', ParseIntPipe) programId: number,
    @Param('courseId', ParseIntPipe) courseId: number,
  ): Promise<void> {
    return this.programCourseService.removeByProgramAndCourse(
      programId,
      courseId,
    );
  }
}
