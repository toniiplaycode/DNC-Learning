import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserGrade, GradeType } from '../../entities/UserGrade';
import { User } from '../../entities/User';
import { Course } from '../../entities/Course';
import { UserInstructor } from '../../entities/UserInstructor';
import { CourseLesson } from '../../entities/CourseLesson';
import { Assignment } from '../../entities/Assignment';
import { Quiz } from '../../entities/Quiz';
import { CreateUserGradeDto } from './dto/create-user-grade.dto';
import { UpdateUserGradeDto } from './dto/update-user-grade.dto';
import { plainToClass } from 'class-transformer';
import { UserGradeResponseDto } from './dto/user-grade-response.dto';

@Injectable()
export class UserGradesService {
  constructor(
    @InjectRepository(UserGrade)
    private userGradeRepository: Repository<UserGrade>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(UserInstructor)
    private instructorRepository: Repository<UserInstructor>,
    @InjectRepository(CourseLesson)
    private lessonRepository: Repository<CourseLesson>,
    @InjectRepository(Assignment)
    private assignmentRepository: Repository<Assignment>,
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,
  ) {}

  async create(createUserGradeDto: CreateUserGradeDto): Promise<UserGrade> {
    // Kiểm tra người dùng tồn tại
    const user = await this.userRepository.findOne({
      where: { id: createUserGradeDto.userId },
    });
    if (!user) {
      throw new NotFoundException(
        `Không tìm thấy người dùng với ID ${createUserGradeDto.userId}`,
      );
    }

    // Kiểm tra khóa học tồn tại
    const course = await this.courseRepository.findOne({
      where: { id: createUserGradeDto.courseId },
    });
    if (!course) {
      throw new NotFoundException(
        `Không tìm thấy khóa học với ID ${createUserGradeDto.courseId}`,
      );
    }

    // Kiểm tra giảng viên tồn tại
    const instructor = await this.instructorRepository.findOne({
      where: { id: createUserGradeDto.gradedBy },
    });
    if (!instructor) {
      throw new NotFoundException(
        `Không tìm thấy giảng viên với ID ${createUserGradeDto.gradedBy}`,
      );
    }

    // Kiểm tra bài học (nếu có)
    if (createUserGradeDto.lessonId) {
      const lesson = await this.lessonRepository.findOne({
        where: {
          id: createUserGradeDto.lessonId,
          section: { course: { id: createUserGradeDto.courseId } },
        },
        relations: ['section', 'section.course'],
      });
      if (!lesson) {
        throw new BadRequestException(
          `Bài học không hợp lệ hoặc không thuộc khóa học này`,
        );
      }
    }

    // Kiểm tra bài tập (nếu có)
    if (createUserGradeDto.assignmentId) {
      const assignment = await this.assignmentRepository.findOne({
        where: { id: createUserGradeDto.assignmentId },
        relations: ['lesson', 'lesson.section', 'lesson.section.course'],
      });
      if (
        !assignment ||
        assignment.lesson.section.course.id !== createUserGradeDto.courseId
      ) {
        throw new BadRequestException(
          `Bài tập không hợp lệ hoặc không thuộc khóa học này`,
        );
      }
    }

    // Kiểm tra bài kiểm tra (nếu có)
    if (createUserGradeDto.quizId) {
      const quiz = await this.quizRepository.findOne({
        where: { id: createUserGradeDto.quizId },
        relations: ['lesson', 'lesson.section', 'lesson.section.course'],
      });
      if (
        !quiz ||
        quiz.lesson.section.course.id !== createUserGradeDto.courseId
      ) {
        throw new BadRequestException(
          `Bài kiểm tra không hợp lệ hoặc không thuộc khóa học này`,
        );
      }
    }

    // Kiểm tra loại điểm phù hợp với dữ liệu
    this.validateGradeType(createUserGradeDto);

    // Tạo điểm mới
    const userGrade = this.userGradeRepository.create(createUserGradeDto);
    return this.userGradeRepository.save(userGrade);
  }

  async findAll(filters?: {
    userId?: number;
    courseId?: number;
    gradeType?: GradeType;
  }): Promise<UserGradeResponseDto[]> {
    const queryBuilder = this.userGradeRepository
      .createQueryBuilder('grade')
      .leftJoinAndSelect('grade.user', 'user')
      .leftJoinAndSelect('grade.course', 'course')
      .leftJoinAndSelect('grade.instructor', 'instructor')
      .leftJoinAndSelect('grade.lesson', 'lesson')
      .leftJoinAndSelect('grade.assignment', 'assignment')
      .leftJoinAndSelect('grade.quiz', 'quiz');

    if (filters?.userId) {
      queryBuilder.andWhere('grade.userId = :userId', {
        userId: filters.userId,
      });
    }

    if (filters?.courseId) {
      queryBuilder.andWhere('grade.courseId = :courseId', {
        courseId: filters.courseId,
      });
    }

    if (filters?.gradeType) {
      queryBuilder.andWhere('grade.gradeType = :gradeType', {
        gradeType: filters.gradeType,
      });
    }

    const grades = await queryBuilder.getMany();
    return grades.map((grade) =>
      plainToClass(UserGradeResponseDto, grade, {
        excludeExtraneousValues: true,
      }),
    );
  }

  async findByCourse(
    courseId: number,
    userId?: number,
  ): Promise<UserGradeResponseDto[]> {
    const queryBuilder = this.userGradeRepository
      .createQueryBuilder('grade')
      .leftJoinAndSelect('grade.user', 'user')
      .leftJoinAndSelect('grade.course', 'course')
      .leftJoinAndSelect('grade.instructor', 'instructor')
      .leftJoinAndSelect('grade.lesson', 'lesson')
      .leftJoinAndSelect('grade.assignment', 'assignment')
      .leftJoinAndSelect('grade.quiz', 'quiz')
      .where('grade.courseId = :courseId', { courseId });

    if (userId) {
      queryBuilder.andWhere('grade.userId = :userId', { userId });
    }

    const grades = await queryBuilder.getMany();
    return grades.map((grade) =>
      plainToClass(UserGradeResponseDto, grade, {
        excludeExtraneousValues: true,
      }),
    );
  }

  async findByUser(userId: number): Promise<UserGradeResponseDto[]> {
    const grades = await this.userGradeRepository.find({
      where: { userId },
      relations: [
        'user',
        'course',
        'instructor',
        'lesson',
        'assignment',
        'quiz',
      ],
    });
    return grades.map((grade) =>
      plainToClass(UserGradeResponseDto, grade, {
        excludeExtraneousValues: true,
      }),
    );
  }

  async findOne(id: number): Promise<UserGradeResponseDto> {
    const grade = await this.userGradeRepository.findOne({
      where: { id },
      relations: [
        'user',
        'course',
        'instructor',
        'lesson',
        'assignment',
        'quiz',
      ],
    });

    if (!grade) {
      throw new NotFoundException(`Không tìm thấy điểm với ID ${id}`);
    }

    return plainToClass(UserGradeResponseDto, grade, {
      excludeExtraneousValues: true,
    });
  }

  async update(
    id: number,
    updateUserGradeDto: UpdateUserGradeDto,
    instructorId?: number,
  ): Promise<UserGradeResponseDto> {
    const grade = await this.userGradeRepository.findOne({
      where: { id },
      relations: ['user', 'course', 'instructor'],
    });

    if (!grade) {
      throw new NotFoundException(`Không tìm thấy điểm với ID ${id}`);
    }

    // Kiểm tra quyền chỉnh sửa điểm
    if (instructorId && grade.gradedBy !== instructorId) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa điểm này');
    }

    // Cập nhật thông tin điểm
    Object.assign(grade, updateUserGradeDto);

    // Lưu lại và trả về kết quả
    const updatedGrade = await this.userGradeRepository.save(grade);
    return plainToClass(UserGradeResponseDto, updatedGrade, {
      excludeExtraneousValues: true,
    });
  }

  async remove(id: number, instructorId?: number): Promise<void> {
    const grade = await this.userGradeRepository.findOne({
      where: { id },
    });

    if (!grade) {
      throw new NotFoundException(`Không tìm thấy điểm với ID ${id}`);
    }

    // Kiểm tra quyền xóa điểm
    if (instructorId && grade.gradedBy !== instructorId) {
      throw new ForbiddenException('Bạn không có quyền xóa điểm này');
    }

    await this.userGradeRepository.remove(grade);
  }

  async calculateCourseGrade(
    userId: number,
    courseId: number,
  ): Promise<{
    totalScore: number;
    maxScore: number;
    percentage: number;
    grades: UserGradeResponseDto[];
  }> {
    const grades = await this.findByCourse(courseId, userId);

    if (grades.length === 0) {
      return {
        totalScore: 0,
        maxScore: 0,
        percentage: 0,
        grades: [],
      };
    }

    let totalWeightedScore = 0;
    let totalWeightedMaxScore = 0;

    grades.forEach((grade) => {
      totalWeightedScore += grade.score * grade.weight;
      totalWeightedMaxScore += grade.maxScore * grade.weight;
    });

    return {
      totalScore: totalWeightedScore,
      maxScore: totalWeightedMaxScore,
      percentage:
        totalWeightedMaxScore > 0
          ? (totalWeightedScore / totalWeightedMaxScore) * 100
          : 0,
      grades,
    };
  }

  private validateGradeType(dto: CreateUserGradeDto): void {
    // Kiểm tra điểm loại ASSIGNMENT cần có assignmentId
    if (dto.gradeType === GradeType.ASSIGNMENT && !dto.assignmentId) {
      throw new BadRequestException('Điểm loại ASSIGNMENT cần có mã bài tập');
    }

    // Kiểm tra điểm loại QUIZ cần có quizId
    if (dto.gradeType === GradeType.QUIZ && !dto.quizId) {
      throw new BadRequestException('Điểm loại QUIZ cần có mã bài kiểm tra');
    }
  }
}
