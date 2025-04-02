import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { UserGrade, GradeType } from '../../entities/UserGrade';
import { User } from '../../entities/User';
import { Course } from '../../entities/Course';
import { UserInstructor } from '../../entities/UserInstructor';
import { CourseLesson } from '../../entities/CourseLesson';
import { Assignment } from '../../entities/Assignment';
import { Quiz } from '../../entities/Quiz';
import { CreateUserGradeDto } from './dto/create-user-grade.dto';
import { UpdateUserGradeDto } from './dto/update-user-grade.dto';
import { GradeSummaryDto } from './dto/grade-summary.dto';
import { plainToClass } from 'class-transformer';

// Define an interface for the course performance object
export interface CoursePerformance {
  courseId: number;
  courseTitle: string;
  averageGrade: number;
  gradeCount: number;
}

@Injectable()
export class UserGradesService {
  constructor(
    @InjectRepository(UserGrade)
    private userGradesRepository: Repository<UserGrade>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Course)
    private coursesRepository: Repository<Course>,
    @InjectRepository(UserInstructor)
    private instructorsRepository: Repository<UserInstructor>,
    @InjectRepository(CourseLesson)
    private lessonsRepository: Repository<CourseLesson>,
    @InjectRepository(Assignment)
    private assignmentsRepository: Repository<Assignment>,
    @InjectRepository(Quiz)
    private quizzesRepository: Repository<Quiz>,
  ) {}

  async create(createUserGradeDto: CreateUserGradeDto): Promise<UserGrade> {
    // Kiểm tra user tồn tại
    const user = await this.usersRepository.findOne({
      where: { id: createUserGradeDto.userId },
    });
    if (!user) {
      throw new NotFoundException(
        `Không tìm thấy học viên với ID ${createUserGradeDto.userId}`,
      );
    }

    // Kiểm tra course tồn tại
    const course = await this.coursesRepository.findOne({
      where: { id: createUserGradeDto.courseId },
    });
    if (!course) {
      throw new NotFoundException(
        `Không tìm thấy khóa học với ID ${createUserGradeDto.courseId}`,
      );
    }

    // Kiểm tra instructor tồn tại
    const instructor = await this.instructorsRepository.findOne({
      where: { id: createUserGradeDto.gradedBy },
    });
    if (!instructor) {
      throw new NotFoundException(
        `Không tìm thấy giảng viên với ID ${createUserGradeDto.gradedBy}`,
      );
    }

    // Kiểm tra các thành phần tùy chọn nếu có
    if (createUserGradeDto.lessonId) {
      const lesson = await this.lessonsRepository.findOne({
        where: { id: createUserGradeDto.lessonId },
      });
      if (!lesson) {
        throw new NotFoundException(
          `Không tìm thấy bài học với ID ${createUserGradeDto.lessonId}`,
        );
      }
    }

    if (createUserGradeDto.assignmentId) {
      const assignment = await this.assignmentsRepository.findOne({
        where: { id: createUserGradeDto.assignmentId },
      });
      if (!assignment) {
        throw new NotFoundException(
          `Không tìm thấy bài tập với ID ${createUserGradeDto.assignmentId}`,
        );
      }
    }

    if (createUserGradeDto.quizId) {
      const quiz = await this.quizzesRepository.findOne({
        where: { id: createUserGradeDto.quizId },
      });
      if (!quiz) {
        throw new NotFoundException(
          `Không tìm thấy bài kiểm tra với ID ${createUserGradeDto.quizId}`,
        );
      }
    }

    // Tạo bản ghi điểm mới
    const userGrade = this.userGradesRepository.create({
      ...createUserGradeDto,
      gradedAt: new Date(),
    });

    return this.userGradesRepository.save(userGrade);
  }

  async findAll(
    userId?: number,
    courseId?: number,
    gradeType?: GradeType,
  ): Promise<UserGrade[]> {
    const whereConditions: any = {};

    if (userId) {
      whereConditions.userId = userId;
    }

    if (courseId) {
      whereConditions.courseId = courseId;
    }

    if (gradeType) {
      whereConditions.gradeType = gradeType;
    }

    const userGrades = await this.userGradesRepository.find({
      where: whereConditions,
      relations: [
        'user',
        'course',
        'instructor',
        'instructor.user',
        'lesson',
        'assignment',
        'quiz',
      ],
      order: {
        createdAt: 'DESC',
      },
    });

    return userGrades;
  }

  async findOne(id: number): Promise<UserGrade> {
    const userGrade = await this.userGradesRepository.findOne({
      where: { id },
      relations: [
        'user',
        'course',
        'instructor',
        'instructor.user',
        'lesson',
        'assignment',
        'quiz',
      ],
    });

    if (!userGrade) {
      throw new NotFoundException(`Không tìm thấy điểm với ID ${id}`);
    }

    return userGrade;
  }

  async findByUserAndCourse(
    userId: number,
    courseId: number,
  ): Promise<UserGrade[]> {
    return this.userGradesRepository.find({
      where: { userId, courseId },
      relations: [
        'user',
        'course',
        'instructor',
        'instructor.user',
        'lesson',
        'assignment',
        'quiz',
      ],
      select: {
        user: {
          id: true,
          username: true,
          email: true,
          avatarUrl: true,
        },
        course: {
          id: true,
          title: true,
          categoryId: true,
          description: true,
          thumbnailUrl: true,
        },
        instructor: {
          id: true,
          fullName: true,
          user: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findByUserAndGradeType(
    userId: number,
    gradeType: GradeType,
  ): Promise<UserGrade[]> {
    return this.userGradesRepository.find({
      where: { userId, gradeType },
      relations: [
        'user',
        'course',
        'instructor',
        'instructor.user',
        'lesson',
        'assignment',
        'quiz',
      ],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async update(
    id: number,
    updateUserGradeDto: UpdateUserGradeDto,
    instructorId?: number,
  ): Promise<UserGrade> {
    const userGrade = await this.findOne(id);

    // Kiểm tra quyền cập nhật (chỉ giảng viên chấm điểm mới có quyền sửa)
    if (instructorId && userGrade.gradedBy !== instructorId) {
      throw new ForbiddenException(
        'Bạn không có quyền cập nhật điểm này vì không phải người chấm điểm',
      );
    }

    // Cập nhật thông tin điểm
    Object.assign(userGrade, updateUserGradeDto);

    // Cập nhật ngày chấm điểm
    userGrade.gradedAt = new Date();

    return this.userGradesRepository.save(userGrade);
  }

  async remove(id: number, instructorId?: number): Promise<void> {
    const userGrade = await this.findOne(id);

    // Kiểm tra quyền xóa (chỉ giảng viên chấm điểm mới có quyền xóa)
    if (instructorId && userGrade.gradedBy !== instructorId) {
      throw new ForbiddenException(
        'Bạn không có quyền xóa điểm này vì không phải người chấm điểm',
      );
    }

    await this.userGradesRepository.remove(userGrade);
  }

  async calculateCourseGrade(
    userId: number,
    courseId: number,
  ): Promise<GradeSummaryDto> {
    // Lấy tất cả điểm của học viên trong khóa học
    const grades = await this.findByUserAndCourse(userId, courseId);

    if (grades.length === 0) {
      throw new NotFoundException(
        `Không tìm thấy điểm nào cho học viên ${userId} trong khóa học ${courseId}`,
      );
    }

    // Khởi tạo đối tượng kết quả
    const result: GradeSummaryDto = {
      userId,
      courseId,
      overallGrade: 0,
      assignments: {
        average: 0,
        totalWeight: 0,
        count: 0,
      },
      quizzes: {
        average: 0,
        totalWeight: 0,
        count: 0,
      },
      midterm: {
        score: 0,
        maxScore: 0,
        weight: 0,
      },
      final: {
        score: 0,
        maxScore: 0,
        weight: 0,
      },
      participation: {
        score: 0,
        maxScore: 0,
        weight: 0,
      },
      gradesByType: {
        [GradeType.ASSIGNMENT]: { average: 0, weight: 0, count: 0 },
        [GradeType.QUIZ]: { average: 0, weight: 0, count: 0 },
        [GradeType.MIDTERM]: { average: 0, weight: 0, count: 0 },
        [GradeType.FINAL]: { average: 0, weight: 0, count: 0 },
        [GradeType.PARTICIPATION]: { average: 0, weight: 0, count: 0 },
      },
    };

    // Tính toán điểm theo từng loại
    let totalWeightedScore = 0;
    let totalWeight = 0;

    for (const grade of grades) {
      const normalizedScore =
        (Number(grade.score) / Number(grade.maxScore)) * 100;
      const weight = Number(grade.weight) || 1;

      // Cập nhật thông tin cho từng loại
      result.gradesByType[grade.gradeType].count += 1;
      result.gradesByType[grade.gradeType].weight += weight;

      // Tính điểm trung bình cho loại này
      const currentType = result.gradesByType[grade.gradeType];
      currentType.average =
        (currentType.average * (currentType.count - 1) + normalizedScore) /
        currentType.count;

      // Tích lũy vào điểm tổng
      totalWeightedScore += normalizedScore * weight;
      totalWeight += weight;

      // Cập nhật thông tin chi tiết cho từng loại
      switch (grade.gradeType) {
        case GradeType.ASSIGNMENT:
          result.assignments.count += 1;
          result.assignments.totalWeight += weight;
          result.assignments.average =
            (result.assignments.average * (result.assignments.count - 1) +
              normalizedScore) /
            result.assignments.count;
          break;

        case GradeType.QUIZ:
          result.quizzes.count += 1;
          result.quizzes.totalWeight += weight;
          result.quizzes.average =
            (result.quizzes.average * (result.quizzes.count - 1) +
              normalizedScore) /
            result.quizzes.count;
          break;

        case GradeType.MIDTERM:
          result.midterm.score = Number(grade.score);
          result.midterm.maxScore = Number(grade.maxScore);
          result.midterm.weight = weight;
          break;

        case GradeType.FINAL:
          result.final.score = Number(grade.score);
          result.final.maxScore = Number(grade.maxScore);
          result.final.weight = weight;
          break;

        case GradeType.PARTICIPATION:
          result.participation.score = Number(grade.score);
          result.participation.maxScore = Number(grade.maxScore);
          result.participation.weight = weight;
          break;
      }
    }

    // Tính điểm trung bình tổng
    if (totalWeight > 0) {
      result.overallGrade = totalWeightedScore / totalWeight;
    }

    return plainToClass(GradeSummaryDto, result);
  }

  async getStudentPerformanceStats(userId: number) {
    // Lấy tất cả điểm của học viên
    const grades = await this.userGradesRepository.find({
      where: { userId },
    });

    if (grades.length === 0) {
      return {
        overallAverage: 0,
        courseCount: 0,
        gradesByType: {
          [GradeType.ASSIGNMENT]: 0,
          [GradeType.QUIZ]: 0,
          [GradeType.MIDTERM]: 0,
          [GradeType.FINAL]: 0,
          [GradeType.PARTICIPATION]: 0,
        },
        coursePerformance: [],
      };
    }

    // Lấy danh sách các khóa học mà học viên có điểm
    const courseIds = [...new Set(grades.map((grade) => grade.courseId))];

    // Thống kê điểm trung bình cho từng loại điểm
    const gradesByType = {
      [GradeType.ASSIGNMENT]: 0,
      [GradeType.QUIZ]: 0,
      [GradeType.MIDTERM]: 0,
      [GradeType.FINAL]: 0,
      [GradeType.PARTICIPATION]: 0,
    };

    const typeCounters = {
      [GradeType.ASSIGNMENT]: 0,
      [GradeType.QUIZ]: 0,
      [GradeType.MIDTERM]: 0,
      [GradeType.FINAL]: 0,
      [GradeType.PARTICIPATION]: 0,
    };

    let overallTotal = 0;
    let overallCount = 0;

    // Tính điểm trung bình cho từng loại
    for (const grade of grades) {
      const normalizedScore =
        (Number(grade.score) / Number(grade.maxScore)) * 100;
      gradesByType[grade.gradeType] += normalizedScore;
      typeCounters[grade.gradeType]++;
      overallTotal += normalizedScore;
      overallCount++;
    }

    // Tính trung bình cho các loại điểm
    for (const type in gradesByType) {
      if (typeCounters[type] > 0) {
        gradesByType[type] = gradesByType[type] / typeCounters[type];
      }
    }

    // Tính điểm trung bình tổng
    const overallAverage = overallCount > 0 ? overallTotal / overallCount : 0;

    // Lấy thông tin chi tiết về các khóa học
    const courses = await this.coursesRepository.findBy({ id: In(courseIds) });
    const courseMap = new Map(courses.map((course) => [course.id, course]));

    // Initialize the array with the proper type
    const coursePerformance: CoursePerformance[] = [];

    // Tính điểm trung bình cho từng khóa học
    for (const courseId of courseIds) {
      const courseGrades = grades.filter(
        (grade) => grade.courseId === courseId,
      );
      let courseTotal = 0;
      let courseWeight = 0;

      for (const grade of courseGrades) {
        const normalizedScore =
          (Number(grade.score) / Number(grade.maxScore)) * 100;
        const weight = Number(grade.weight) || 1;
        courseTotal += normalizedScore * weight;
        courseWeight += weight;
      }

      const courseAverage = courseWeight > 0 ? courseTotal / courseWeight : 0;
      const course = courseMap.get(courseId);

      coursePerformance.push({
        courseId,
        courseTitle: course?.title || `Khóa học ${courseId}`,
        averageGrade: courseAverage,
        gradeCount: courseGrades.length,
      });
    }

    return {
      overallAverage,
      courseCount: courseIds.length,
      gradesByType,
      coursePerformance,
    };
  }
}
