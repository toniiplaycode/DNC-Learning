import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, getManager } from 'typeorm';
import { Enrollment, EnrollmentStatus } from '../../entities/Enrollment';
import { Course } from '../../entities/Course';
import { User } from '../../entities/User';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { CourseProgress } from '../../entities/CourseProgress';
import { CourseLesson } from '../../entities/CourseLesson';
import { CourseSection } from '../../entities/CourseSection';
import { AcademicClassCourse } from '../../entities/AcademicClassCourse';
import { UserStudentAcademic } from '../../entities/UserStudentAcademic';

// Move interface to class level
export interface ProgressResult {
  enrollmentId: number;
  courseId: number;
  courseTitle: string;
  courseImage: string;
  enrollmentDate: Date;
  enrollmentStatus: string;
  totalLessons: number;
  completedLessons: number;
  completionPercentage: number;
  lastAccessedLesson: { id: number; title: string } | null;
  lastAccessTime: Date | null;
}

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private enrollmentsRepository: Repository<Enrollment>,
    @InjectRepository(Course)
    private coursesRepository: Repository<Course>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(CourseProgress)
    private progressRepository: Repository<CourseProgress>,
    @InjectRepository(CourseLesson)
    private lessonRepository: Repository<CourseLesson>,
    @InjectRepository(CourseSection)
    private sectionRepository: Repository<CourseSection>,
    @InjectRepository(AcademicClassCourse)
    private academicClassCourseRepository: Repository<AcademicClassCourse>,
    @InjectRepository(UserStudentAcademic)
    private userStudentAcademicRepository: Repository<UserStudentAcademic>,
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

    // Check if course is for the correct user type
    if (course.for !== 'both') {
      if (
        course.for === 'student_academic' &&
        user.role !== 'student_academic'
      ) {
        throw new BadRequestException(
          'This course is only available for academic students',
        );
      }
      if (course.for === 'student' && user.role !== 'student') {
        throw new BadRequestException(
          'This course is only available for regular students',
        );
      }
    }

    // Create new enrollment
    const enrollment = this.enrollmentsRepository.create({
      ...createEnrollmentDto,
      enrollmentDate: new Date(),
      status: createEnrollmentDto.status || EnrollmentStatus.ACTIVE,
    });

    return this.enrollmentsRepository.save(enrollment);
  }

  // Add this method to the EnrollmentsService class
  async findByInstructor(instructorId: number): Promise<any[]> {
    try {
      // 1. Get all courses taught by the instructor
      const courses = await this.coursesRepository.find({
        where: { instructorId },
        select: ['id', 'title', 'thumbnailUrl', 'price'],
      });

      if (!courses.length) {
        return [];
      }

      const courseIds = courses.map((course) => course.id);

      // 2. Get all enrollments for these courses
      const enrollments = await this.enrollmentsRepository.find({
        where: { courseId: In(courseIds) },
        relations: ['user', 'course'],
        order: { enrollmentDate: 'DESC' },
      });

      // 3. Get progress data for analytics
      const enrollmentStats = await Promise.all(
        courseIds.map(async (courseId) => {
          const courseEnrollments = enrollments.filter(
            (e) => e.courseId === courseId,
          );

          // Get course-specific stats
          const totalStudents = courseEnrollments.length;
          const completedCount = courseEnrollments.filter(
            (e) => e.status === EnrollmentStatus.COMPLETED,
          ).length;
          const activeCount = courseEnrollments.filter(
            (e) => e.status === EnrollmentStatus.ACTIVE,
          ).length;
          const droppedCount = courseEnrollments.filter(
            (e) => e.status === EnrollmentStatus.DROPPED,
          ).length;

          // Calculate completion rate
          const completionRate =
            totalStudents > 0
              ? Math.round((completedCount / totalStudents) * 100)
              : 0;

          return {
            courseId,
            courseTitle: courses.find((c) => c.id === courseId)?.title,
            thumbnailUrl: courses.find((c) => c.id === courseId)?.thumbnailUrl,
            price: courses.find((c) => c.id === courseId)?.price,
            totalStudents,
            completedCount,
            activeCount,
            droppedCount,
            completionRate,
          };
        }),
      );

      // 4. Add monthly enrollment data for charts
      const monthlyData = this.calculateMonthlyEnrollments(enrollments);
      return [
        ...enrollments,
        {
          courseStats: enrollmentStats,
          monthlyData,
        },
      ];
    } catch (error) {
      console.error('Error finding enrollments by instructor:', error);
      throw new Error('Could not retrieve instructor enrollment data');
    }
  }

  // Helper method to calculate monthly enrollments
  private calculateMonthlyEnrollments(enrollments: Enrollment[]): any[] {
    const monthlyMap = new Map();

    // Define last 6 months
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today);
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap.set(monthKey, {
        month: `T${date.getMonth() + 1}`,
        year: date.getFullYear(),
        count: 0,
        students: new Set(),
      });
    }

    // Fill data
    enrollments.forEach((enrollment) => {
      const date = new Date(enrollment.enrollmentDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (monthlyMap.has(monthKey)) {
        const monthData = monthlyMap.get(monthKey);
        monthData.count++;
        monthData.students.add(enrollment.userId);
      }
    });

    // Convert to array for easier consumption
    return Array.from(monthlyMap.entries()).map(([key, data]) => ({
      month: data.month,
      year: data.year,
      count: data.count,
      uniqueStudents: data.students.size,
    }));
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
      order: {
        enrollmentDate: 'ASC',
      },
    });
  }

  async findByCourse(courseId: number): Promise<Enrollment[]> {
    return this.enrollmentsRepository.find({
      where: { courseId },
      relations: ['user'],
    });
  }

  async getAllUsersByCourse(courseId: number) {
    try {
      // Get users from enrollments
      const enrolledUsers = await this.enrollmentsRepository
        .createQueryBuilder('enrollment')
        .leftJoinAndSelect('enrollment.user', 'enrolledUser')
        .leftJoinAndSelect('enrolledUser.userStudent', 'userStudent')
        .where('enrollment.courseId = :courseId', { courseId })
        .getMany();

      // Get users from academic classes
      const academicUsers = await this.academicClassCourseRepository
        .createQueryBuilder('acc')
        .leftJoinAndSelect('acc.academicClass', 'academicClass')
        .leftJoinAndSelect('academicClass.studentsAcademic', 'studentAcademic')
        .leftJoinAndSelect('studentAcademic.user', 'academicUser')
        .leftJoinAndSelect(
          'academicUser.userStudentAcademic',
          'userStudentAcademic',
        )
        .where('acc.courseId = :courseId', { courseId })
        .getMany();

      // Combine and deduplicate users
      const users = new Map();

      // Add enrolled users
      enrolledUsers.forEach((enrollment) => {
        if (enrollment.user) {
          users.set(enrollment.user.id, {
            ...enrollment.user,
            enrollmentType: 'regular',
            enrollmentId: enrollment.id,
            enrollmentDate: enrollment.enrollmentDate,
          });
        }
      });

      // Add academic users
      academicUsers.forEach((acc) => {
        acc.academicClass?.studentsAcademic?.forEach((studentAcademic) => {
          if (studentAcademic.user) {
            users.set(studentAcademic.user.id, {
              ...studentAcademic.user,
              enrollmentType: 'academic',
              academicClassId: acc.academicClass.id,
              classCode: acc.academicClass.classCode,
              className: acc.academicClass.className,
            });
          }
        });
      });

      return Array.from(users.values());
    } catch (error) {
      console.error('Error getting users for course:', error);
      throw new Error('Không thể lấy danh sách người dùng cho khóa học này');
    }
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
    if (progress === 100) {
      enrollment.status = EnrollmentStatus.COMPLETED;
      enrollment.completionDate = new Date();
    }

    return this.enrollmentsRepository.save(enrollment);
  }

  async getStudentEnrollmentStats(userId: number) {
    const enrollments = await this.findByUser(userId);
    const progressResults = await this.getUserLearningProgress(userId);

    // Tạo map để truy cập nhanh các thông tin progress theo courseId
    const progressMap = new Map();
    progressResults.forEach((progress) => {
      progressMap.set(progress.courseId, progress);
    });

    const stats = {
      totalEnrollments: enrollments.length,
      completed: 0,
      inProgress: 0,
      dropped: 0,
      averageProgress: 0,
    };

    let totalProgress = 0;

    enrollments.forEach((enrollment) => {
      // Lấy tiến độ từ progressResults thay vì từ trường progress cũ
      const progressData = progressMap.get(enrollment.courseId);
      const courseProgress = progressData
        ? progressData.completionPercentage
        : 0;
      totalProgress += courseProgress;

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

  /**
   * Lấy tiến độ học tập của người dùng cho tất cả khóa học đã đăng ký
   * @param userId ID của người dùng
   */
  async getUserLearningProgress(userId: number): Promise<ProgressResult[]> {
    // 1. Lấy tất cả khóa học mà người dùng đã đăng ký
    const enrollments = await this.enrollmentsRepository.find({
      where: { userId },
      relations: ['course'],
    });

    const progressResults: ProgressResult[] = [];

    // 2. Xử lý từng khóa học một
    for (const enrollment of enrollments) {
      const courseId = enrollment.courseId;

      // 2.1 Đếm tổng số bài học trong khóa học
      const totalLessons = await this.lessonRepository
        .createQueryBuilder('lesson')
        .innerJoin(CourseSection, 'section', 'lesson.sectionId = section.id')
        .where('section.courseId = :courseId', { courseId })
        .getCount();

      // 2.2 Đếm số bài học đã hoàn thành
      const completedLessons = await this.progressRepository
        .createQueryBuilder('progress')
        .innerJoin(CourseLesson, 'lesson', 'progress.lessonId = lesson.id')
        .innerJoin(CourseSection, 'section', 'lesson.sectionId = section.id')
        .where('progress.userId = :userId', { userId })
        .andWhere('section.courseId = :courseId', { courseId })
        .andWhere('progress.completedAt IS NOT NULL')
        .getCount();

      // 2.3 Tính phần trăm hoàn thành
      const completionPercentage =
        totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100 * 100) / 100
          : 0;

      // 2.4 Lấy thông tin bài học truy cập gần đây nhất - KHÔNG dùng GROUP BY
      const lastProgressRecord = await this.progressRepository
        .createQueryBuilder('progress')
        .select([
          'progress.id',
          'progress.userId',
          'progress.lessonId',
          'progress.completedAt',
          'progress.lastAccessed',
        ])
        .where('progress.userId = :userId', { userId })
        .orderBy('progress.lastAccessed', 'DESC')
        .take(1)
        .getOne();

      let lastAccessedLesson: { id: number; title: string } | null = null;
      let lastAccessTime: Date | null = null;

      if (lastProgressRecord) {
        // Truy vấn riêng biệt để lấy thông tin lesson
        const lessonInfo = await this.lessonRepository.findOne({
          where: { id: lastProgressRecord.lessonId },
        });

        // Kiểm tra xem lesson có thuộc khóa học này không
        if (lessonInfo) {
          const section = await this.sectionRepository.findOne({
            where: { id: lessonInfo.sectionId },
          });

          if (section && section.courseId === courseId) {
            lastAccessedLesson = {
              id: lessonInfo.id,
              title: lessonInfo.title,
            };
            lastAccessTime = lastProgressRecord.lastAccessed;
          }
        }
      }

      // 2.6 Thêm vào kết quả
      progressResults.push({
        enrollmentId: enrollment.id,
        courseId: enrollment.courseId,
        courseTitle: enrollment.course.title,
        courseImage: enrollment.course.thumbnailUrl,
        enrollmentDate: enrollment.enrollmentDate,
        enrollmentStatus: enrollment.status,
        totalLessons,
        completedLessons,
        completionPercentage,
        lastAccessedLesson,
        lastAccessTime,
      });
    }

    // 3. Sắp xếp kết quả
    progressResults.sort((a, b) => {
      if (a.lastAccessTime && b.lastAccessTime) {
        return (
          new Date(b.lastAccessTime).getTime() -
          new Date(a.lastAccessTime).getTime()
        );
      } else if (a.lastAccessTime) {
        return -1;
      } else if (b.lastAccessTime) {
        return 1;
      } else {
        return (
          new Date(b.enrollmentDate).getTime() -
          new Date(a.enrollmentDate).getTime()
        );
      }
    });

    return progressResults;
  }

  /**
   * Lấy tiến độ học tập chi tiết cho một khóa học cụ thể
   * @param userId ID của người dùng
   * @param courseId ID của khóa học
   */
  async getCourseProgressDetail(userId: number, courseId: number) {
    // 1. Tìm thông tin ghi danh
    const enrollment = await this.enrollmentsRepository.findOne({
      where: {
        userId,
        courseId,
      },
    });

    if (!enrollment) {
      throw new NotFoundException(
        `Không tìm thấy khóa học ID ${courseId} cho người dùng ID ${userId}`,
      );
    }

    // 2. Lấy tất cả các section của khóa học
    const sections = await this.sectionRepository.find({
      where: { courseId },
      order: { orderNumber: 'ASC' },
      relations: ['lessons'],
    });

    if (!sections.length) {
      throw new NotFoundException(
        `Không tìm thấy nội dung cho khóa học ID ${courseId}`,
      );
    }

    // 3. Lấy progress của user cho tất cả bài học trong khóa học
    const lessonIds = sections.flatMap((section) =>
      section.lessons.map((lesson) => lesson.id),
    );

    // 4. Lấy thông tin progress từ repository
    const progressRecords = await this.progressRepository
      .createQueryBuilder('progress')
      .select('progress') // Chỉ chọn các cột có trong entity
      .where('progress.userId = :userId', { userId })
      .andWhere('progress.lessonId IN (:...lessonIds)', { lessonIds })
      .getMany();

    // 5. Tạo map của progress để truy cập nhanh
    const progressMap = new Map();
    progressRecords.forEach((record) => {
      progressMap.set(record.lessonId, record);
    });

    // 6. Tạo kết quả chi tiết theo từng section
    const sectionProgress = sections.map((section) => {
      // Xử lý các bài học trong section
      const lessonsWithProgress = section.lessons.map((lesson) => {
        const progress = progressMap.get(lesson.id);
        return {
          ...lesson,
          completed: progress?.completedAt ? true : false,
          lastAccessed: progress?.lastAccessed || null,
        };
      });

      // Đếm số bài học đã hoàn thành trong section
      const completedLessons = lessonsWithProgress.filter(
        (lesson) => lesson.completed,
      ).length;

      return {
        sectionId: section.id,
        sectionTitle: section.title,
        orderNumber: section.orderNumber,
        totalLessons: section.lessons.length,
        completedLessons,
        completionPercentage:
          section.lessons.length > 0
            ? Math.round(
                (completedLessons / section.lessons.length) * 100 * 100,
              ) / 100
            : 0,
        lessons: lessonsWithProgress,
      };
    });

    // 7. Tính tổng tiến độ khóa học
    const allLessons = sections.reduce(
      (acc, section) => acc + section.lessons.length,
      0,
    );
    const allCompleted = sectionProgress.reduce(
      (acc, section) => acc + section.completedLessons,
      0,
    );

    return {
      enrollmentId: enrollment.id,
      enrollmentDate: enrollment.enrollmentDate,
      enrollmentStatus: enrollment.status,
      totalLessons: allLessons,
      completedLessons: allCompleted,
      completionPercentage:
        allLessons > 0
          ? Math.round((allCompleted / allLessons) * 100 * 100) / 100
          : 0,
      sections: sectionProgress,
    };
  }
}
