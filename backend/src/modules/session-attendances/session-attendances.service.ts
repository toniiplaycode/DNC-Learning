import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindManyOptions } from 'typeorm';
import {
  SessionAttendance,
  AttendanceStatus,
} from '../../entities/SessionAttendance';
import { TeachingSchedule } from '../../entities/TeachingSchedule';
import { UserStudentAcademic } from '../../entities/UserStudentAcademic';
import { plainToClass } from 'class-transformer';
import { CreateSessionAttendanceDto } from './dto/create-session-attendance.dto';
import { ResponseSessionAttendanceDto } from './dto/response-session-attendance.dto';
import { UpdateSessionAttendanceDto } from './dto/update-session-attendance.dto';

@Injectable()
export class SessionAttendancesService {
  constructor(
    @InjectRepository(SessionAttendance)
    private sessionAttendanceRepository: Repository<SessionAttendance>,
    @InjectRepository(TeachingSchedule)
    private teachingScheduleRepository: Repository<TeachingSchedule>,
    @InjectRepository(UserStudentAcademic)
    private userStudentAcademicRepository: Repository<UserStudentAcademic>,
  ) {}

  async create(
    createSessionAttendanceDto: CreateSessionAttendanceDto,
  ): Promise<ResponseSessionAttendanceDto> {
    // Check if teaching schedule exists
    const schedule = await this.teachingScheduleRepository.findOne({
      where: { id: createSessionAttendanceDto.scheduleId },
    });

    if (!schedule) {
      throw new NotFoundException(
        `Teaching schedule with ID ${createSessionAttendanceDto.scheduleId} not found`,
      );
    }

    // Check if student academic exists
    const studentAcademic = await this.userStudentAcademicRepository.findOne({
      where: { id: createSessionAttendanceDto.studentAcademicId },
    });

    if (!studentAcademic) {
      throw new NotFoundException(
        `Student academic with ID ${createSessionAttendanceDto.studentAcademicId} not found`,
      );
    }

    // Check if attendance record already exists
    const existingAttendance = await this.sessionAttendanceRepository.findOne({
      where: {
        scheduleId: createSessionAttendanceDto.scheduleId,
        studentAcademicId: createSessionAttendanceDto.studentAcademicId,
      },
    });

    if (existingAttendance) {
      throw new BadRequestException(
        `Attendance record already exists for student ${createSessionAttendanceDto.studentAcademicId} in schedule ${createSessionAttendanceDto.scheduleId}`,
      );
    }

    // Calculate duration if both join and leave times are provided
    let durationMinutes = createSessionAttendanceDto.durationMinutes;
    if (
      createSessionAttendanceDto.joinTime &&
      createSessionAttendanceDto.leaveTime &&
      !durationMinutes
    ) {
      const joinTime = new Date(createSessionAttendanceDto.joinTime);
      const leaveTime = new Date(createSessionAttendanceDto.leaveTime);
      durationMinutes = Math.round(
        (leaveTime.getTime() - joinTime.getTime()) / (1000 * 60),
      );
    }

    const newAttendance = this.sessionAttendanceRepository.create({
      ...createSessionAttendanceDto,
      durationMinutes,
    });

    const savedAttendance =
      await this.sessionAttendanceRepository.save(newAttendance);

    return plainToClass(ResponseSessionAttendanceDto, savedAttendance, {
      excludeExtraneousValues: true,
    });
  }

  async findAll(
    scheduleId?: number,
    studentAcademicId?: number,
  ): Promise<ResponseSessionAttendanceDto[]> {
    const options: FindManyOptions<SessionAttendance> = {
      relations: [
        'teachingSchedule',
        'studentAcademic',
        'studentAcademic.user',
      ],
    };

    if (scheduleId) {
      options.where = { ...options.where, scheduleId };
    }

    if (studentAcademicId) {
      options.where = { ...options.where, studentAcademicId };
    }

    const attendances = await this.sessionAttendanceRepository.find(options);

    return attendances.map((attendance) =>
      plainToClass(ResponseSessionAttendanceDto, attendance, {
        excludeExtraneousValues: true,
      }),
    );
  }

  async findOne(id: number): Promise<ResponseSessionAttendanceDto> {
    const attendance = await this.sessionAttendanceRepository.findOne({
      where: { id },
      relations: [
        'teachingSchedule',
        'studentAcademic',
        'studentAcademic.user',
      ],
    });

    if (!attendance) {
      throw new NotFoundException(`Session attendance with ID ${id} not found`);
    }

    return plainToClass(ResponseSessionAttendanceDto, attendance, {
      excludeExtraneousValues: true,
    });
  }

  async update(
    id: number,
    updateSessionAttendanceDto: UpdateSessionAttendanceDto,
  ): Promise<ResponseSessionAttendanceDto> {
    const attendance = await this.sessionAttendanceRepository.findOne({
      where: { id },
    });

    if (!attendance) {
      throw new NotFoundException(`Session attendance with ID ${id} not found`);
    }

    // Recalculate duration if both join and leave times are provided
    let durationMinutes = updateSessionAttendanceDto.durationMinutes;
    if (
      (updateSessionAttendanceDto.joinTime || attendance.joinTime) &&
      (updateSessionAttendanceDto.leaveTime || attendance.leaveTime) &&
      !durationMinutes
    ) {
      const joinTime = updateSessionAttendanceDto.joinTime
        ? new Date(updateSessionAttendanceDto.joinTime)
        : attendance.joinTime;
      const leaveTime = updateSessionAttendanceDto.leaveTime
        ? new Date(updateSessionAttendanceDto.leaveTime)
        : attendance.leaveTime;

      if (joinTime && leaveTime) {
        durationMinutes = Math.round(
          (leaveTime.getTime() - joinTime.getTime()) / (1000 * 60),
        );
        updateSessionAttendanceDto.durationMinutes = durationMinutes;
      }
    }

    const updatedAttendance = await this.sessionAttendanceRepository.save({
      ...attendance,
      ...updateSessionAttendanceDto,
    });

    const result = await this.sessionAttendanceRepository.findOne({
      where: { id },
      relations: ['teachingSchedule', 'studentAcademic'],
    });

    return plainToClass(ResponseSessionAttendanceDto, result, {
      excludeExtraneousValues: true,
    });
  }

  async remove(id: number): Promise<void> {
    const attendance = await this.sessionAttendanceRepository.findOne({
      where: { id },
    });

    if (!attendance) {
      throw new NotFoundException(`Session attendance with ID ${id} not found`);
    }

    await this.sessionAttendanceRepository.remove(attendance);
  }

  async markAttendance(
    scheduleId: number,
    studentAcademicId: number,
    status: AttendanceStatus,
  ): Promise<ResponseSessionAttendanceDto> {
    // Check if attendance record already exists
    let attendance = await this.sessionAttendanceRepository.findOne({
      where: {
        scheduleId,
        studentAcademicId,
      },
    });

    const joinTime = new Date();

    if (attendance) {
      // Update existing record
      attendance.status = status;
      attendance.joinTime = joinTime;
      attendance.leaveTime = null as any;
      attendance.durationMinutes = null as any;
    } else {
      // Create new record
      attendance = this.sessionAttendanceRepository.create({
        scheduleId,
        studentAcademicId,
        status,
        joinTime,
      });
    }

    const savedAttendance =
      await this.sessionAttendanceRepository.save(attendance);

    return plainToClass(ResponseSessionAttendanceDto, savedAttendance, {
      excludeExtraneousValues: true,
    });
  }

  async markLeave(
    scheduleId: number,
    studentAcademicId: number,
  ): Promise<ResponseSessionAttendanceDto> {
    const attendance = await this.sessionAttendanceRepository.findOne({
      where: {
        scheduleId,
        studentAcademicId,
      },
    });

    if (!attendance) {
      throw new NotFoundException(
        `No attendance record found for student ${studentAcademicId} in schedule ${scheduleId}`,
      );
    }

    if (!attendance.joinTime) {
      throw new BadRequestException(`Student has not joined this session yet`);
    }

    const leaveTime = new Date();
    const durationMinutes = Math.round(
      (leaveTime.getTime() - attendance.joinTime.getTime()) / (1000 * 60),
    );

    attendance.leaveTime = leaveTime;
    attendance.durationMinutes = durationMinutes;

    const savedAttendance =
      await this.sessionAttendanceRepository.save(attendance);

    return plainToClass(ResponseSessionAttendanceDto, savedAttendance, {
      excludeExtraneousValues: true,
    });
  }

  async getAttendanceStats(scheduleId: number): Promise<{
    totalStudents: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
  }> {
    const attendances = await this.sessionAttendanceRepository.find({
      where: { scheduleId },
    });

    const stats = {
      totalStudents: attendances.length,
      present: attendances.filter((a) => a.status === AttendanceStatus.PRESENT)
        .length,
      absent: attendances.filter((a) => a.status === AttendanceStatus.ABSENT)
        .length,
      late: attendances.filter((a) => a.status === AttendanceStatus.LATE)
        .length,
      excused: attendances.filter((a) => a.status === AttendanceStatus.EXCUSED)
        .length,
    };

    return stats;
  }

  async getStudentAttendanceStats(studentAcademicId: number): Promise<{
    totalSessions: number;
    attended: number;
    absent: number;
    late: number;
    excused: number;
    attendancePercentage: number;
  }> {
    const attendances = await this.sessionAttendanceRepository.find({
      where: { studentAcademicId },
    });

    const totalSessions = attendances.length;
    const attended = attendances.filter(
      (a) => a.status === AttendanceStatus.PRESENT,
    ).length;
    const absent = attendances.filter(
      (a) => a.status === AttendanceStatus.ABSENT,
    ).length;
    const late = attendances.filter(
      (a) => a.status === AttendanceStatus.LATE,
    ).length;
    const excused = attendances.filter(
      (a) => a.status === AttendanceStatus.EXCUSED,
    ).length;

    const attendancePercentage =
      totalSessions > 0
        ? Math.round(((attended + late) / totalSessions) * 100)
        : 0;

    return {
      totalSessions,
      attended,
      absent,
      late,
      excused,
      attendancePercentage,
    };
  }
}
