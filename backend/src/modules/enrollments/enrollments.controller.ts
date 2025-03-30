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
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UserRole } from '../../entities/User';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createEnrollmentDto: CreateEnrollmentDto,
    @GetUser() user,
  ) {
    // If user is a student, they can only enroll themselves
    if (
      user.role === UserRole.STUDENT &&
      createEnrollmentDto.userId !== user.id
    ) {
      createEnrollmentDto.userId = user.id;
    }

    return this.enrollmentsService.create(createEnrollmentDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  findAll() {
    return this.enrollmentsService.findAll();
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  findByUser(@Param('userId', ParseIntPipe) userId: number, @GetUser() user) {
    console.log('user', user);
    // Check if user is requesting their own enrollments or is admin/instructor
    if (user.role === UserRole.STUDENT && user.id !== userId) {
      userId = user.id;
    }

    return this.enrollmentsService.findByUser(userId);
  }

  @Get('course/:courseId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  findByCourse(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.enrollmentsService.findByCourse(courseId);
  }

  @Get('stats/:userId')
  @UseGuards(JwtAuthGuard)
  getStudentStats(
    @Param('userId', ParseIntPipe) userId: number,
    @GetUser() user,
  ) {
    // Check if user is requesting their own stats or is admin/instructor
    if (user.role === UserRole.STUDENT && user.id !== userId) {
      userId = user.id;
    }

    return this.enrollmentsService.getStudentEnrollmentStats(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number, @GetUser() user) {
    return this.enrollmentsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEnrollmentDto: UpdateEnrollmentDto,
    @GetUser() user,
  ) {
    return this.enrollmentsService.update(id, updateEnrollmentDto);
  }

  @Patch(':id/progress')
  @UseGuards(JwtAuthGuard)
  updateProgress(
    @Param('id', ParseIntPipe) id: number,
    @Body('progress', ParseIntPipe) progress: number,
    @GetUser() user,
  ) {
    return this.enrollmentsService.updateProgress(id, progress);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number, @GetUser() user) {
    return this.enrollmentsService.remove(id);
  }
}
