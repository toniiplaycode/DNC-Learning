import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { SessionAttendancesService } from './session-attendances.service';
import { AttendanceStatus } from '../../entities/SessionAttendance';
import { ResponseSessionAttendanceDto } from './dto/response-session-attendance.dto';
import { UpdateSessionAttendanceDto } from './dto/update-session-attendance.dto';
import { CreateSessionAttendanceDto } from './dto/create-session-attendance.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@Controller('session-attendances')
@UseGuards(JwtAuthGuard)
export class SessionAttendancesController {
  constructor(
    private readonly sessionAttendancesService: SessionAttendancesService,
  ) {}

  @Post()
  async create(
    @Body() createSessionAttendanceDto: CreateSessionAttendanceDto,
  ): Promise<ResponseSessionAttendanceDto> {
    return this.sessionAttendancesService.create(createSessionAttendanceDto);
  }

  @Get()
  async findAll(
    @Query('scheduleId') scheduleId?: number,
    @Query('studentAcademicId') studentAcademicId?: number,
  ): Promise<ResponseSessionAttendanceDto[]> {
    return this.sessionAttendancesService.findAll(
      scheduleId,
      studentAcademicId,
    );
  }

  @Get(':id')
  async findOne(
    @Param('id') id: number,
  ): Promise<ResponseSessionAttendanceDto> {
    return this.sessionAttendancesService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateSessionAttendanceDto: UpdateSessionAttendanceDto,
  ): Promise<ResponseSessionAttendanceDto> {
    return this.sessionAttendancesService.update(
      id,
      updateSessionAttendanceDto,
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<{ message: string }> {
    await this.sessionAttendancesService.remove(id);
    return { message: 'Session attendance record deleted successfully' };
  }

  @Post('mark-attendance')
  async markAttendance(
    @Body()
    data: {
      scheduleId: number;
      studentAcademicId: number;
      status: AttendanceStatus;
    },
  ): Promise<ResponseSessionAttendanceDto> {
    const { scheduleId, studentAcademicId, status } = data;

    if (!scheduleId || !studentAcademicId || !status) {
      throw new BadRequestException('Missing required fields');
    }

    return this.sessionAttendancesService.markAttendance(
      scheduleId,
      studentAcademicId,
      status,
    );
  }

  @Post('mark-leave')
  async markLeave(
    @Body() data: { scheduleId: number; studentAcademicId: number },
  ): Promise<ResponseSessionAttendanceDto> {
    const { scheduleId, studentAcademicId } = data;

    if (!scheduleId || !studentAcademicId) {
      throw new BadRequestException('Missing required fields');
    }

    return this.sessionAttendancesService.markLeave(
      scheduleId,
      studentAcademicId,
    );
  }

  @Get('schedule/:scheduleId/stats')
  async getScheduleAttendanceStats(
    @Param('scheduleId') scheduleId: number,
  ): Promise<{
    totalStudents: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
  }> {
    return this.sessionAttendancesService.getAttendanceStats(scheduleId);
  }

  @Get('student/:studentAcademicId/stats')
  async getStudentAttendanceStats(
    @Param('studentAcademicId') studentAcademicId: number,
  ): Promise<{
    totalSessions: number;
    attended: number;
    absent: number;
    late: number;
    excused: number;
    attendancePercentage: number;
  }> {
    return this.sessionAttendancesService.getStudentAttendanceStats(
      studentAcademicId,
    );
  }
}
