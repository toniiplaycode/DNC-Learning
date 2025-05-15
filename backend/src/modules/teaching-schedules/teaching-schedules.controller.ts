import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { TeachingSchedulesService } from './teaching-schedules.service';
import { CreateTeachingScheduleDto } from './dto/create-teaching-schedule.dto';
import { UpdateTeachingScheduleDto } from './dto/update-teaching-schedule.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ScheduleStatus } from '../../entities/TeachingSchedule';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from 'src/entities/User';

@Controller('teaching-schedules')
@UseGuards(JwtAuthGuard)
export class TeachingSchedulesController {
  constructor(
    private readonly teachingSchedulesService: TeachingSchedulesService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  create(@Body() createTeachingScheduleDto: CreateTeachingScheduleDto) {
    return this.teachingSchedulesService.create(createTeachingScheduleDto);
  }

  @Get()
  findAll(
    @Query('academicClassId') academicClassId?: string,
    @Query('academicClassInstructorId') academicClassInstructorId?: string,
    @Query('instructorId') instructorId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: ScheduleStatus,
  ) {
    const filters: any = {};

    if (academicClassId) {
      filters.academicClassId = parseInt(academicClassId, 10);
    }

    if (academicClassInstructorId) {
      filters.academicClassInstructorId = parseInt(
        academicClassInstructorId,
        10,
      );
    }

    if (instructorId) {
      filters.instructorId = parseInt(instructorId, 10);
    }

    if (startDate) {
      filters.startDate = new Date(startDate);
    }

    if (endDate) {
      filters.endDate = new Date(endDate);
    }

    if (status) {
      filters.status = status;
    }

    return this.teachingSchedulesService.findAll(filters);
  }

  @Get('instructor/:instructorId')
  findByInstructor(@Param('instructorId', ParseIntPipe) instructorId: number) {
    return this.teachingSchedulesService.findByInstructor(instructorId);
  }

  @Get('student/:userStudentAcademicId')
  findByStudent(
    @Param('userStudentAcademicId', ParseIntPipe) userStudentAcademicId: number,
  ) {
    return this.teachingSchedulesService.findByStudent(userStudentAcademicId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.teachingSchedulesService.findOne(id);
  }

  @Get(':id/instructor')
  getInstructorDetails(@Param('id', ParseIntPipe) id: number) {
    return this.teachingSchedulesService.getInstructorDetails(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTeachingScheduleDto: UpdateTeachingScheduleDto,
  ) {
    return this.teachingSchedulesService.update(id, updateTeachingScheduleDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.teachingSchedulesService.remove(id);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: ScheduleStatus,
  ) {
    if (!Object.values(ScheduleStatus).includes(status)) {
      throw new BadRequestException(`Invalid status: ${status}`);
    }
    return this.teachingSchedulesService.updateStatus(id, status);
  }

  @Patch(':id/recording')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  addRecordingUrl(
    @Param('id', ParseIntPipe) id: number,
    @Body('recordingUrl') recordingUrl: string,
  ) {
    if (!recordingUrl) {
      throw new BadRequestException('Recording URL is required');
    }
    return this.teachingSchedulesService.addRecordingUrl(id, recordingUrl);
  }
}
