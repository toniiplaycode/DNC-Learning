import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  Between,
  IsNull,
  Not,
  FindOptionsWhere,
  In,
} from 'typeorm';
import {
  TeachingSchedule,
  ScheduleStatus,
} from '../../entities/TeachingSchedule';
import { CreateTeachingScheduleDto } from './dto/create-teaching-schedule.dto';
import { UpdateTeachingScheduleDto } from './dto/update-teaching-schedule.dto';
import { AcademicClass } from '../../entities/AcademicClass';
import { AcademicClassInstructor } from '../../entities/AcademicClassInstructor';
import { AcademicClassCourse } from '../../entities/AcademicClassCourse';
import { UserInstructor } from '../../entities/UserInstructor';
import { NotificationsService } from '../notifications/notifications.service';
import { UserStudentAcademic } from '../../entities/UserStudentAcademic';
import { SessionAttendance } from '../../entities/SessionAttendance';

@Injectable()
export class TeachingSchedulesService {
  constructor(
    @InjectRepository(TeachingSchedule)
    private teachingSchedulesRepository: Repository<TeachingSchedule>,
    @InjectRepository(AcademicClass)
    private academicClassRepository: Repository<AcademicClass>,
    @InjectRepository(AcademicClassInstructor)
    private academicClassInstructorRepository: Repository<AcademicClassInstructor>,
    @InjectRepository(AcademicClassCourse)
    private academicClassCourseRepository: Repository<AcademicClassCourse>,
    @InjectRepository(UserInstructor)
    private userInstructorRepository: Repository<UserInstructor>,
    @InjectRepository(UserStudentAcademic)
    private userStudentAcademicRepository: Repository<UserStudentAcademic>,
    @InjectRepository(SessionAttendance)
    private sessionAttendanceRepository: Repository<SessionAttendance>,
    private notificationsService: NotificationsService,
  ) {}

  async create(
    createTeachingScheduleDto: CreateTeachingScheduleDto,
  ): Promise<TeachingSchedule> {
    // Validate related entities exist
    const {
      academicClassId,
      academicClassInstructorId,
      academicClassCourseId,
      notificationTime,
      ...scheduleData
    } = createTeachingScheduleDto;

    // Check if academic class exists
    const academicClass = await this.academicClassRepository.findOne({
      where: { id: academicClassId },
    });
    if (!academicClass) {
      throw new NotFoundException(
        `Academic class with ID ${academicClassId} not found`,
      );
    }

    // Check if academic class instructor exists and matches the academic class
    const academicClassInstructor =
      await this.academicClassInstructorRepository.findOne({
        where: {
          id: academicClassInstructorId,
          classId: academicClassId,
        },
        relations: ['instructor'],
      });
    if (!academicClassInstructor) {
      throw new NotFoundException(
        `Academic class instructor with ID ${academicClassInstructorId} not found for class ${academicClassId}`,
      );
    }

    // Check if academic class course exists if provided
    if (academicClassCourseId) {
      const academicClassCourse =
        await this.academicClassCourseRepository.findOne({
          where: {
            id: academicClassCourseId,
            classId: academicClassId,
          },
        });
      if (!academicClassCourse) {
        throw new NotFoundException(
          `Academic class course with ID ${academicClassCourseId} not found for class ${academicClassId}`,
        );
      }
    }

    // Create schedule entity
    const newSchedule = this.teachingSchedulesRepository.create({
      ...scheduleData,
      academicClassId,
      academicClassInstructorId,
      academicClassCourseId,
      status: scheduleData.status || ScheduleStatus.SCHEDULED,
    });

    // Parse recurring pattern if provided
    if (scheduleData.isRecurring && scheduleData.recurringPattern) {
      try {
        const pattern = JSON.parse(scheduleData.recurringPattern);
        newSchedule.recurringPattern = pattern;
      } catch (error) {
        throw new BadRequestException('Invalid recurring pattern format');
      }
    }

    // Save the schedule
    const savedSchedule =
      await this.teachingSchedulesRepository.save(newSchedule);

    // Create notification if needed
    // Get all students in the class
    // For this example, we'll need to implement a method to get student IDs
    const studentIds = await this.getStudentIdsForClass(academicClassId);

    if (studentIds.length > 0) {
      await this.notificationsService.createTeachingScheduleNotification(
        savedSchedule.id,
        studentIds,
        `Lịch học mới: ${savedSchedule.title}`,
        `Bạn có buổi học trực tuyến mới vào lúc ${new Date(savedSchedule.startTime).toLocaleString()}`,
        notificationTime ? new Date(notificationTime) : undefined,
      );
    }

    return savedSchedule;
  }

  async findAll(filters?: {
    academicClassId?: number;
    academicClassInstructorId?: number;
    instructorId?: number;
    startDate?: Date;
    endDate?: Date;
    status?: ScheduleStatus;
  }): Promise<TeachingSchedule[]> {
    const where: FindOptionsWhere<TeachingSchedule> = {};

    if (filters?.academicClassId) {
      where.academicClassId = filters.academicClassId;
    }

    if (filters?.academicClassInstructorId) {
      where.academicClassInstructorId = filters.academicClassInstructorId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.startDate && filters?.endDate) {
      where.startTime = Between(filters.startDate, filters.endDate);
    }

    // Lấy tất cả lịch dạy với quan hệ
    const schedules = await this.teachingSchedulesRepository.find({
      where,
      relations: [
        'academicClass',
        'academicClassInstructor',
        'academicClassInstructor.instructor',
        'academicClassInstructor.instructor.user',
        'academicClassCourse',
        'academicClassCourse.course',
      ],
      order: { startTime: 'ASC' },
    });

    // Nếu có instructorId, lọc thêm theo giảng viên
    const filteredSchedules = filters?.instructorId
      ? schedules.filter(
          (schedule) =>
            schedule.academicClassInstructor?.instructor?.id ===
            filters.instructorId,
        )
      : schedules;

    // Fetch attendance data for each schedule
    const schedulesWithAttendance =
      await this.addAttendanceData(filteredSchedules);

    return schedulesWithAttendance;
  }

  async findOne(id: number): Promise<TeachingSchedule> {
    const schedule = await this.teachingSchedulesRepository.findOne({
      where: { id },
      relations: [
        'academicClass',
        'academicClassInstructor',
        'academicClassInstructor.instructor',
        'academicClassInstructor.instructor.user',
        'academicClassCourse',
        'academicClassCourse.course',
      ],
    });

    if (!schedule) {
      throw new NotFoundException(`Teaching schedule with ID ${id} not found`);
    }

    // Fetch attendance data for this schedule
    const schedulesWithAttendance = await this.addAttendanceData([schedule]);
    return schedulesWithAttendance[0];
  }

  async findByInstructor(instructorId: number): Promise<TeachingSchedule[]> {
    // Tìm tất cả academicClassInstructor của instructor
    const classInstructors = await this.academicClassInstructorRepository.find({
      where: { instructorId },
      select: ['id'],
    });

    if (classInstructors.length === 0) {
      return [];
    }

    // Lấy tất cả ID từ kết quả
    const classInstructorIds = classInstructors.map((item) => item.id);

    // Tìm tất cả lịch dạy của giảng viên
    const schedules = await this.teachingSchedulesRepository.find({
      where: {
        academicClassInstructorId: In(classInstructorIds),
      },
      relations: [
        'academicClass',
        'academicClassInstructor',
        'academicClassInstructor.instructor',
        'academicClassInstructor.instructor.user',
        'academicClassCourse',
        'academicClassCourse.course',
      ],
      order: { startTime: 'ASC' },
    });

    // Fetch attendance data for each schedule
    return this.addAttendanceData(schedules);
  }

  async getInstructorDetails(
    teachingScheduleId: number,
  ): Promise<UserInstructor> {
    const schedule = await this.teachingSchedulesRepository.findOne({
      where: { id: teachingScheduleId },
      relations: [
        'academicClassInstructor',
        'academicClassInstructor.instructor',
      ],
    });

    if (!schedule) {
      throw new NotFoundException(
        `Teaching schedule with ID ${teachingScheduleId} not found`,
      );
    }

    if (!schedule.academicClassInstructor?.instructor) {
      throw new NotFoundException(
        `Instructor not found for teaching schedule with ID ${teachingScheduleId}`,
      );
    }

    // Lấy thông tin chi tiết của giảng viên
    const instructor = await this.userInstructorRepository.findOne({
      where: { id: schedule.academicClassInstructor.instructor.id },
      relations: ['user'],
    });

    if (!instructor) {
      throw new NotFoundException(
        `Instructor details not found for ID ${schedule.academicClassInstructor.instructor.id}`,
      );
    }

    return instructor;
  }

  async update(
    id: number,
    updateTeachingScheduleDto: UpdateTeachingScheduleDto,
  ): Promise<TeachingSchedule> {
    const schedule = await this.findOne(id);

    // Handle changes that require validation
    if (
      updateTeachingScheduleDto.academicClassId &&
      updateTeachingScheduleDto.academicClassId !== schedule.academicClassId
    ) {
      // Validate academic class exists
      const academicClass = await this.academicClassRepository.findOne({
        where: { id: updateTeachingScheduleDto.academicClassId },
      });
      if (!academicClass) {
        throw new NotFoundException(
          `Academic class with ID ${updateTeachingScheduleDto.academicClassId} not found`,
        );
      }
    }

    // Handle recurring pattern update
    if (updateTeachingScheduleDto.recurringPattern) {
      try {
        const pattern = JSON.parse(updateTeachingScheduleDto.recurringPattern);
        updateTeachingScheduleDto.recurringPattern = pattern;
      } catch (error) {
        throw new BadRequestException('Invalid recurring pattern format');
      }
    }

    // Apply updates
    await this.teachingSchedulesRepository.update(
      id,
      updateTeachingScheduleDto as any,
    );

    // Return updated entity
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const schedule = await this.findOne(id);
    await this.teachingSchedulesRepository.remove(schedule);
  }

  async updateStatus(
    id: number,
    status: ScheduleStatus,
  ): Promise<TeachingSchedule> {
    const schedule = await this.findOne(id);
    schedule.status = status;
    return this.teachingSchedulesRepository.save(schedule);
  }

  async addRecordingUrl(
    id: number,
    recordingUrl: string,
  ): Promise<TeachingSchedule> {
    const schedule = await this.findOne(id);
    schedule.recordingUrl = recordingUrl;
    return this.teachingSchedulesRepository.save(schedule);
  }

  async findByStudent(
    userStudentAcademicId: number,
  ): Promise<TeachingSchedule[]> {
    // Get the student's academic classes
    const studentClasses = await this.userStudentAcademicRepository.find({
      where: { id: userStudentAcademicId },
      select: ['academicClassId'],
    });

    if (studentClasses.length === 0) {
      return [];
    }

    // Extract class IDs
    const classIds = studentClasses.map((item) => item.academicClassId);

    // Find teaching schedules for these classes
    const schedules = await this.teachingSchedulesRepository.find({
      where: {
        academicClassId: In(classIds),
      },
      relations: [
        'academicClass',
        'academicClassInstructor',
        'academicClassInstructor.instructor',
        'academicClassInstructor.instructor.user',
        'academicClassCourse',
        'academicClassCourse.course',
      ],
      order: { startTime: 'ASC' },
    });

    // Fetch attendance data for all students in these classes, not just the current student
    return this.addAttendanceData(schedules);
  }

  // Helper method to get student IDs for a class
  private async getStudentIdsForClass(
    academicClassId: number,
  ): Promise<string[]> {
    // This is a placeholder. You would need to implement the actual logic
    // to get student IDs from your UserStudentAcademic or similar entity
    // Example:
    // const students = await this.userStudentAcademicRepository.find({
    //   where: { academicClassId },
    //   select: ['userId']
    // });
    // return students.map(student => student.userId.toString());

    // For now, return an empty array
    return [];
  }

  // Helper method to add attendance data to teaching schedules
  private async addAttendanceData(
    schedules: TeachingSchedule[],
  ): Promise<TeachingSchedule[]> {
    if (schedules.length === 0) {
      return schedules;
    }

    const scheduleIds = schedules.map((schedule) => schedule.id);

    // Build query for attendance data with more detailed student information
    const query = this.sessionAttendanceRepository
      .createQueryBuilder('attendance')
      .where('attendance.scheduleId IN (:...scheduleIds)', { scheduleIds })
      .leftJoinAndSelect('attendance.studentAcademic', 'studentAcademic')
      .leftJoinAndSelect('studentAcademic.user', 'user')
      .leftJoinAndSelect('studentAcademic.academicClass', 'academicClass');

    const attendances = await query.getMany();

    // Group attendances by scheduleId
    const attendanceMap = attendances.reduce((map, attendance) => {
      if (!map[attendance.scheduleId]) {
        map[attendance.scheduleId] = [];
      }
      map[attendance.scheduleId].push(attendance);
      return map;
    }, {});

    // Add the attendance data to each schedule
    return schedules.map((schedule) => {
      const scheduleAttendances = attendanceMap[schedule.id] || [];
      return {
        ...schedule,
        attendances: scheduleAttendances,
      };
    });
  }
}
