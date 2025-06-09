import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { FacultyService } from './faculty.service';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';

@Controller('faculties')
export class FacultyController {
  constructor(private readonly facultyService: FacultyService) {}

  @Post()
  create(@Body() createDto: CreateFacultyDto) {
    return this.facultyService.create(createDto);
  }

  @Get()
  findAll() {
    return this.facultyService.findAll();
  }

  @Get('code/:code')
  findByCode(@Param('code') code: string) {
    return this.facultyService.findByCode(code);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.facultyService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateFacultyDto,
  ) {
    return this.facultyService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.facultyService.remove(id);
  }

  @Get('instructor/:instructorId')
  getInstructorFaculty(
    @Param('instructorId', ParseIntPipe) instructorId: number,
  ) {
    return this.facultyService.findByInstructorId(instructorId);
  }
}
