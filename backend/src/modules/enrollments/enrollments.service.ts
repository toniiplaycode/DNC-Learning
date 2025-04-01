import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment, EnrollmentStatus } from '../../entities/Enrollment';
import { Course } from '../../entities/Course';
import { User } from '../../entities/User';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private enrollmentsRepository: Repository<Enrollment>,
    @InjectRepository(Course)
    private coursesRepository: Repository<Course>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createEnrollmentDto: CreateEnrollmentDto): Promise<Enrollment> {
    const { userId, courseId } = createEnrollmentDto;

    // Check if user exists
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if course exists
    const course = await this.coursesRepository.findOne({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    // Check if enrollment already exists
    const existingEnrollment = await this.enrollmentsRepository.findOne({
      where: { userId, courseId },
    });

    if (existingEnrollment) {
      throw new ConflictException(
        `User ${userId} is already enrolled in course ${courseId}`,
      );
    }

    // Create new enrollment
    const enrollment = this.enrollmentsRepository.create({
      ...createEnrollmentDto,
      enrollmentDate: new Date(),
      status: createEnrollmentDto.status || EnrollmentStatus.ACTIVE,
      progress: createEnrollmentDto.progress || 0,
    });

    return this.enrollmentsRepository.save(enrollment);
  }

  async findAll(): Promise<Enrollment[]> {
    return this.enrollmentsRepository.find({
      relations: ['user', 'course'],
    });
  }

  async findOne(id: number): Promise<Enrollment> {
    const enrollment = await this.enrollmentsRepository.findOne({
      where: { id },
      relations: ['user', 'course'],
    });

    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }

    return enrollment;
  }

  async findByUser(userId: number): Promise<Enrollment[]> {
    return this.enrollmentsRepository.find({
      where: { userId },
      relations: [
        'course',
        'course.instructor',
        'course.instructor.user',
        'course.category',
        'course.sections',
        'course.sections.lessons',
      ],
    });
  }

  async findByCourse(courseId: number): Promise<Enrollment[]> {
    return this.enrollmentsRepository.find({
      where: { courseId },
      relations: ['user'],
    });
  }

  async update(
    id: number,
    updateEnrollmentDto: UpdateEnrollmentDto,
  ): Promise<Enrollment> {
    const enrollment = await this.findOne(id);

    // If status is being changed to COMPLETED and no completion date is provided,
    // set it to current date
    if (
      updateEnrollmentDto.status === EnrollmentStatus.COMPLETED &&
      !updateEnrollmentDto.completionDate &&
      enrollment.status !== EnrollmentStatus.COMPLETED
    ) {
      updateEnrollmentDto.completionDate = new Date();
    }

    // Update the enrollment
    Object.assign(enrollment, updateEnrollmentDto);

    return this.enrollmentsRepository.save(enrollment);
  }

  async remove(id: number): Promise<void> {
    const enrollment = await this.findOne(id);
    await this.enrollmentsRepository.remove(enrollment);
  }

  async updateProgress(id: number, progress: number): Promise<Enrollment> {
    if (progress < 0 || progress > 100) {
      throw new BadRequestException('Progress must be between 0 and 100');
    }

    const enrollment = await this.findOne(id);

    // If progress is 100%, mark as completed
    if (progress === 100 && enrollment.progress !== 100) {
      enrollment.status = EnrollmentStatus.COMPLETED;
      enrollment.completionDate = new Date();
    }

    enrollment.progress = progress;
    return this.enrollmentsRepository.save(enrollment);
  }

  async getStudentEnrollmentStats(userId: number) {
    const enrollments = await this.findByUser(userId);

    const stats = {
      totalEnrollments: enrollments.length,
      completed: 0,
      inProgress: 0,
      dropped: 0,
      averageProgress: 0,
    };

    let totalProgress = 0;

    enrollments.forEach((enrollment) => {
      totalProgress += enrollment.progress;

      switch (enrollment.status) {
        case EnrollmentStatus.COMPLETED:
          stats.completed++;
          break;
        case EnrollmentStatus.ACTIVE:
          stats.inProgress++;
          break;
        case EnrollmentStatus.DROPPED:
          stats.dropped++;
          break;
      }
    });

    stats.averageProgress =
      enrollments.length > 0
        ? Math.round(totalProgress / enrollments.length)
        : 0;

    return stats;
  }
}
