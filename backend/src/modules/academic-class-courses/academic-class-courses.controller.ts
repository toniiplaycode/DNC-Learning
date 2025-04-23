import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { AcademicClassCoursesService } from './academic-class-courses.service';
import { CreateAcademicClassCourseDto } from './dto/create-academic-class-courses.dto';
import { UpdateAcademicClassCourseDto } from './dto/update-academic-class-courses.dto';

@Controller('academic-class-courses')
export class AcademicClassCoursesController {
  constructor(
    private readonly academicClassCoursesService: AcademicClassCoursesService,
  ) {}

  @Get()
  findAll() {
    return this.academicClassCoursesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.academicClassCoursesService.findOne(id);
  }

  @Get('class/:classId/courses')
  findCoursesByClassId(@Param('classId', ParseIntPipe) classId: number) {
    return this.academicClassCoursesService.findCoursesByClassId(classId);
  }

  @Post()
  create(@Body() createDto: any) {
    return this.academicClassCoursesService.create(createDto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateAcademicClassCourseDto,
  ) {
    return this.academicClassCoursesService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.academicClassCoursesService.remove(id);
  }
}
