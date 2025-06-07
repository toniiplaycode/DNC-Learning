import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AcademicClassesService } from './academic-class.service';
import { UpdateAcademicClassDto } from './dto/update-class-academic.dto';

@Controller('academic-classes')
export class AcademicClassesController {
  constructor(
    private readonly academicClassesService: AcademicClassesService,
  ) {}

  @Post()
  create(@Body() createDto: any) {
    const instructorId = createDto.instructorId;
    if (!instructorId) {
      throw new UnauthorizedException('User must be an instructor');
    }
    return this.academicClassesService.create(createDto, instructorId);
  }

  @Get()
  findAll() {
    return this.academicClassesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.academicClassesService.findOne(id);
  }

  @Get(':id/program-courses')
  getClassProgramCourses(@Param('id', ParseIntPipe) id: number) {
    return this.academicClassesService.getClassProgramCourses(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateAcademicClassDto,
  ) {
    return this.academicClassesService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.academicClassesService.remove(id);
  }
}
