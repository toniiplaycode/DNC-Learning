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
import { ProgramService } from './program.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';

@Controller('programs')
export class ProgramController {
  constructor(private readonly programService: ProgramService) {}

  @Post()
  create(@Body() createProgramDto: CreateProgramDto) {
    return this.programService.create(createProgramDto);
  }

  @Get()
  findAll(@Query('majorId') majorId?: number) {
    return this.programService.findAll(majorId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.programService.findOne(id);
  }

  @Get('code/:code')
  findByCode(@Param('code') code: string) {
    return this.programService.findByCode(code);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProgramDto: UpdateProgramDto,
  ) {
    return this.programService.update(id, updateProgramDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.programService.remove(id);
  }

  // Program Course Management
  @Post(':programId/courses/:courseId')
  addCourseToProgram(
    @Param('programId', ParseIntPipe) programId: number,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body('credits') credits: number,
    @Body('semester') semester: number = 1,
    @Body('practice') practice: number = 0,
    @Body('theory') theory: number = 0,
    @Body('isMandatory') isMandatory: boolean = true,
  ) {
    return this.programService.addCourseToProgram(
      programId,
      courseId,
      credits,
      semester,
      practice,
      theory,
      isMandatory,
    );
  }

  @Delete(':programId/courses/:courseId')
  removeCourseFromProgram(
    @Param('programId', ParseIntPipe) programId: number,
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    return this.programService.removeCourseFromProgram(programId, courseId);
  }

  @Patch(':programId/courses/:courseId')
  updateProgramCourse(
    @Param('programId', ParseIntPipe) programId: number,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body('credits') credits: number,
    @Body('isMandatory') isMandatory: boolean,
  ) {
    return this.programService.updateProgramCourse(
      programId,
      courseId,
      credits,
      isMandatory,
    );
  }
}
