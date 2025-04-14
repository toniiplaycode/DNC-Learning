import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Patch,
} from '@nestjs/common';
import { CourseSectionService } from './course-section.service';
import { CreateCourseSectionDto } from './dto/create-course-section.dto';
import { UpdateCourseSectionDto } from './dto/update-course-section.dto';

@Controller('course-sections')
export class CourseSectionController {
  constructor(private readonly courseSectionService: CourseSectionService) {}

  @Post()
  create(@Body() createCourseSectionDto: CreateCourseSectionDto) {
    return this.courseSectionService.create(createCourseSectionDto);
  }

  @Get()
  findAll() {
    return this.courseSectionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courseSectionService.findOne(+id);
  }

  @Get('course/:courseId')
  findByCourse(@Param('courseId') courseId: number) {
    return this.courseSectionService.findByCourseId(courseId);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateCourseSectionDto: UpdateCourseSectionDto,
  ) {
    console.log(updateCourseSectionDto);
    return this.courseSectionService.update(id, updateCourseSectionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.courseSectionService.remove(+id);
  }
}
