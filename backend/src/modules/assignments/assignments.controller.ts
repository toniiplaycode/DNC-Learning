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
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/User';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { AssignmentType } from '../../entities/Assignment';

@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  create(@Body() createAssignmentDto: CreateAssignmentDto) {
    return this.assignmentsService.create(createAssignmentDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.assignmentsService.findOne(id);
  }

  @Get('/lesson/:id')
  @UseGuards(JwtAuthGuard)
  findByLesson(@Param('id', ParseIntPipe) id: number) {
    return this.assignmentsService.findByLesson(id);
  }

  @Get('student-academic/:id')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.STUDENT_ACADEMIC)
  async findAllByStudentAcademicInAcademicClass(
    @Param('id', ParseIntPipe) studentAcademicId: number,
  ) {
    return this.assignmentsService.findAllByStudentAcademicInAcademicClass(
      studentAcademicId,
    );
  }

  @Get('course/:id')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.INSTRUCTOR)
  async findAllByCourse(@Param('id', ParseIntPipe) studentAcademicId: number) {
    return this.assignmentsService.findAllByCourse(studentAcademicId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAssignmentDto: UpdateAssignmentDto,
  ) {
    return this.assignmentsService.update(id, updateAssignmentDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.assignmentsService.remove(id);
  }
}
