import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/User';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}
  findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: {
        userStudent: true,
        userStudentAcademic: true,
        userInstructor: true,
      },
    });
  }
  async create(userData: Partial<User>): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = this.userRepository.create(userData);
    newUser.password = hashedPassword;
    return this.userRepository.save(newUser);
  }

  async findStudentsByInstructorId(instructorId: number): Promise<User[]> {
    // 1. Tìm tất cả khóa học mà instructor dạy
    // 2. Sau đó tìm tất cả học sinh đã đăng ký các khóa học đó
    // 3. Hiển thị cả thông tin khóa học đã đăng ký và điểm số

    const students = await this.userRepository
      .createQueryBuilder('user')
      .innerJoin('enrollments', 'enrollment', 'user.id = enrollment.user_id')
      .innerJoin('courses', 'course', 'enrollment.course_id = course.id')
      .innerJoin(
        'user_instructors',
        'instructor',
        'course.instructor_id = instructor.id',
      )
      .where('instructor.id = :instructorId', { instructorId })
      .andWhere('user.role IN (:...roles)', {
        roles: ['student', 'student_academic'],
      })
      .leftJoinAndSelect('user.userStudent', 'userStudent')
      .leftJoinAndSelect('user.userStudentAcademic', 'userStudentAcademic')
      .leftJoinAndSelect('userStudentAcademic.academicClass', 'academicClass')
      .leftJoinAndSelect('user.enrollments', 'userEnrollments')
      .leftJoinAndSelect('userEnrollments.course', 'enrolledCourse')
      // Thêm relation grades cho mỗi enrollment
      .leftJoinAndMapMany(
        'userEnrollments.grades',
        'user_grades',
        'grades',
        'user.id = grades.user_id AND userEnrollments.course_id = grades.course_id',
      )
      // Lấy thêm thông tin liên quan đến điểm
      .leftJoinAndSelect('grades.lesson', 'gradeLesson')
      .leftJoinAndSelect('grades.assignmentSubmission', 'gradeAssignment')
      .leftJoinAndSelect('grades.quizAttempt', 'gradeQuiz')
      .distinct(true)
      .getMany();

    return students;
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: {
        userStudent: true,
        userStudentAcademic: true,
        userInstructor: true,
      },
    });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: {
        userStudent: true,
        userStudentAcademic: true,
        userInstructor: true,
      },
    });
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    throw new UnauthorizedException('password or email is incorrect !');
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (user) {
      user.refreshToken = refreshToken;
      await this.userRepository.save(user);
    }
    return null;
  }

  async verifyRefreshToken(refreshToken: string, userId?: number) {
    const user = await this.userRepository.findOneBy({ refreshToken });
    if (user) {
      return user;
    }
    return false;
  }
}
