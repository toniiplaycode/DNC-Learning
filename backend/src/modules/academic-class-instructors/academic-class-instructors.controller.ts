import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { AcademicClassInstructorsService } from './academic-class-instructors.service';
import { CreateClassInstructorDto } from './dto/create-class-instructor.dto';
import { UpdateClassInstructorDto } from './dto/update-class-instructor.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/User';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('academic-class-instructors')
export class AcademicClassInstructorsController {
  constructor(
    private readonly classInstructorsService: AcademicClassInstructorsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() createClassInstructorDto: CreateClassInstructorDto) {
    return this.classInstructorsService.create(createClassInstructorDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @Query('classId') classId?: number,
    @Query('instructorId') instructorId?: number,
  ) {
    if (classId) {
      return this.classInstructorsService.findByClassId(classId);
    }

    if (instructorId) {
      return this.classInstructorsService.findByInstructorId(instructorId);
    }

    return this.classInstructorsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.classInstructorsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClassInstructorDto: UpdateClassInstructorDto,
  ) {
    return this.classInstructorsService.update(id, updateClassInstructorDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.classInstructorsService.remove(id);
  }
}
