import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import {
  AssignmentSubmission,
  SubmissionStatus,
} from '../../entities/AssignmentSubmission';
import { Assignment } from '../../entities/Assignment';
import { User } from '../../entities/User';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';
import { UserGradesService } from '../user-grades/user-grades.service';
import { GradeType } from '../../entities/UserGrade';

@Injectable()
export class AssignmentSubmissionsService {
  constructor(
    @InjectRepository(AssignmentSubmission)
    private submissionsRepository: Repository<AssignmentSubmission>,
    @InjectRepository(Assignment)
    private assignmentsRepository: Repository<Assignment>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private userGradesService: UserGradesService,
  ) {}

  async create(
    createSubmissionDto: CreateSubmissionDto,
    userId: number,
  ): Promise<AssignmentSubmission> {
    // Kiểm tra assignment có tồn tại không
    const assignment = await this.assignmentsRepository.findOne({
      where: { id: createSubmissionDto.assignmentId },
    });

    if (!assignment) {
      throw new NotFoundException(
        `Assignment với ID ${createSubmissionDto.assignmentId} không tồn tại`,
      );
    }

    // Kiểm tra người dùng có tồn tại không
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User với ID ${userId} không tồn tại`);
    }

    // Kiểm tra nếu đã nộp bài trước đó
    const existingSubmission = await this.submissionsRepository.findOne({
      where: {
        assignmentId: createSubmissionDto.assignmentId,
        userId,
      },
    });

    if (existingSubmission) {
      throw new BadRequestException(
        'Bạn đã nộp bài cho assignment này rồi. Hãy sử dụng update để chỉnh sửa.',
      );
    }

    // Kiểm tra thời hạn nộp bài
    const now = new Date();
    if (assignment.dueDate && new Date(assignment.dueDate) < now) {
      // Nếu quá hạn, vẫn cho phép nộp nhưng đánh dấu là nộp muộn
      const submission = this.submissionsRepository.create({
        ...createSubmissionDto,
        userId,
        status: SubmissionStatus.LATE,
        submittedAt: now,
      });
      return this.submissionsRepository.save(submission);
    }

    // Tạo submission mới
    const submission = this.submissionsRepository.create({
      ...createSubmissionDto,
      userId,
      status: SubmissionStatus.SUBMITTED,
      submittedAt: now,
    });

    return this.submissionsRepository.save(submission);
  }

  async findAll(): Promise<AssignmentSubmission[]> {
    return this.submissionsRepository.find({
      relations: ['assignment', 'user'],
    });
  }

  async findByAssignment(
    id: number,
    userId?: number,
  ): Promise<AssignmentSubmission | {}> {
    // Kiểm tra id có hợp lệ không
    if (!id || isNaN(id)) {
      return {};
    }

    const submission = await this.submissionsRepository.findOne({
      where: { assignmentId: id, userId },
      relations: ['assignment'],
    });

    // Trả về object trống nếu không tìm thấy
    if (!submission) {
      return {};
    }

    return submission;
  }

  async findByUser(userId: number): Promise<AssignmentSubmission[]> {
    return this.submissionsRepository.find({
      where: { userId },
      relations: ['assignment'],
    });
  }

  async findOne(id: number): Promise<AssignmentSubmission> {
    const submission = await this.submissionsRepository.findOne({
      where: { id },
      relations: ['assignment', 'user'],
    });

    if (!submission) {
      throw new NotFoundException(`Submission với ID ${id} không tồn tại`);
    }

    return submission;
  }

  async findAllSubmissionsByInstructor(
    instructorId: number,
  ): Promise<AssignmentSubmission[]> {
    try {
      const submissions = await this.submissionsRepository
        .createQueryBuilder('submission')
        .leftJoinAndSelect('submission.assignment', 'assignment')
        .leftJoinAndSelect('submission.user', 'user')
        .leftJoinAndSelect('user.userStudent', 'userStudent')
        .leftJoinAndSelect('user.userStudentAcademic', 'userStudentAcademic')
        .leftJoinAndSelect('assignment.lesson', 'lesson')
        .leftJoinAndSelect('lesson.section', 'section')
        .leftJoinAndSelect('section.course', 'course')
        .leftJoinAndSelect('course.instructor', 'courseInstructor')
        .leftJoinAndSelect('assignment.academicClass', 'academicClass')
        .leftJoinAndSelect('academicClass.instructors', 'classInstructor')
        .where(
          new Brackets((qb) => {
            qb.where('courseInstructor.id = :instructorId', {
              instructorId,
            }).orWhere('classInstructor.instructorId = :instructorId', {
              instructorId,
            });
          }),
        )
        .getMany();

      if (!submissions) {
        return [];
      }

      return submissions;
    } catch (error) {
      console.error('Error getting submissions:', error);
      throw new BadRequestException('Không thể lấy danh sách bài nộp');
    }
  }

  async update(
    id: number,
    updateSubmissionDto: UpdateSubmissionDto,
    userId: number,
  ): Promise<AssignmentSubmission> {
    const submission = await this.findOne(id);

    // Kiểm tra quyền sửa (chỉ người nộp mới được sửa)
    if (submission.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền sửa bài nộp này');
    }

    // Kiểm tra trạng thái (nếu đã chấm điểm rồi thì không được sửa)
    if (submission.status === SubmissionStatus.GRADED) {
      throw new BadRequestException('Không thể sửa bài nộp đã được chấm điểm');
    }

    // Kiểm tra thời hạn nộp bài
    const assignment = await this.assignmentsRepository.findOne({
      where: { id: submission.assignmentId },
    });

    const now = new Date();
    if (
      assignment &&
      assignment.dueDate &&
      new Date(assignment.dueDate) < now
    ) {
      // Cập nhật trạng thái thành nộp muộn
      Object.assign(submission, {
        ...updateSubmissionDto,
        status: SubmissionStatus.LATE,
        submittedAt: now,
      });
    } else {
      Object.assign(submission, {
        ...updateSubmissionDto,
        submittedAt: now,
      });
    }

    return this.submissionsRepository.save(submission);
  }

  async grade(
    id: number,
    gradeSubmissionDto: GradeSubmissionDto,
    instructorId: number,
  ): Promise<AssignmentSubmission> {
    const submission = await this.findOne(id);

    // Cập nhật thông tin chấm điểm
    Object.assign(submission, {
      score: gradeSubmissionDto.score,
      feedback: gradeSubmissionDto.feedback,
      status: gradeSubmissionDto.status || SubmissionStatus.GRADED,
    });

    const gradedSubmission = await this.submissionsRepository.save(submission);

    // Tạo bản ghi điểm trong user_grades
    await this.userGradesService.create({
      userId: submission.userId,
      courseId: submission.assignment.lessonId
        ? submission.assignment.lesson.section.courseId
        : 0,
      gradedBy: instructorId,
      lessonId: submission.assignment.lessonId ?? undefined,
      assignmentId: submission.assignmentId,
      gradeType: GradeType.ASSIGNMENT,
      score: gradeSubmissionDto.score,
      maxScore: submission.assignment.maxScore || 100,
      weight: 1,
      feedback: gradeSubmissionDto.feedback,
    });

    return gradedSubmission;
  }

  async remove(
    id: number,
    userId: number,
    isAdmin: boolean = false,
  ): Promise<void> {
    const submission = await this.findOne(id);

    // Kiểm tra quyền xóa (người nộp hoặc admin)
    if (submission.userId !== userId && !isAdmin) {
      throw new ForbiddenException('Bạn không có quyền xóa bài nộp này');
    }

    // Kiểm tra trạng thái (nếu đã chấm điểm rồi thì không được xóa, trừ khi là admin)
    if (submission.status === SubmissionStatus.GRADED && !isAdmin) {
      throw new BadRequestException('Không thể xóa bài nộp đã được chấm điểm');
    }

    await this.submissionsRepository.remove(submission);
  }
}
