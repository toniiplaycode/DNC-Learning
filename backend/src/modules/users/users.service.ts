import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from 'src/entities/User';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserStudentAcademic } from '../../entities/UserStudentAcademic';

interface StudentUserData {
  user: {
    username: string;
    email: string;
    password: string;
    role: UserRole;
    phone: string;
  };
  userStudentAcademic: {
    academicClassId: string;
    studentCode: string;
    fullName: string;
    academicYear: string;
  };
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserStudentAcademic)
    private userStudentAcademic: Repository<UserStudentAcademic>,
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

  async createManyStudentAcademic(
    studentsData: StudentUserData[],
  ): Promise<UserStudentAcademic[]> {
    // Use transaction to ensure data consistency
    return this.userRepository.manager.transaction(
      async (transactionalEntityManager) => {
        try {
          const createdStudentAcademics: UserStudentAcademic[] = [];

          // Process each student data
          for (const studentData of studentsData) {
            // 1. Create user first
            const hashedPassword = await bcrypt.hash(
              studentData.user.password,
              10,
            );
            const newUser = this.userRepository.create({
              ...studentData.user,
              password: hashedPassword,
            });

            // Save user
            const savedUser = await transactionalEntityManager.save(
              User,
              newUser,
            );

            // 2. Create student academic record with the new user ID
            const studentAcademic = this.userStudentAcademic.create({
              ...studentData.userStudentAcademic,
              academicClassId: Number(
                studentData.userStudentAcademic.academicClassId,
              ),
              userId: savedUser.id,
            });

            // Save student academic record
            const savedStudentAcademic = await transactionalEntityManager.save(
              UserStudentAcademic,
              {
                ...studentAcademic,
                userId: savedUser.id,
              },
            );

            createdStudentAcademics.push(savedStudentAcademic);
          }

          return createdStudentAcademics;
        } catch (error) {
          // If any error occurs, the transaction will rollback
          throw new Error(`Failed to create students: ${error.message}`);
        }
      },
    );
  }

  async updateStudentAcademic(updateData: any): Promise<any> {
    return this.userRepository.manager.transaction(
      async (transactionalEntityManager) => {
        try {
          // Update user information
          const user = await transactionalEntityManager.update(
            User,
            { id: updateData.user.id },
            {
              username: updateData.user.username,
              email: updateData.user.email,
              phone: updateData.user.phone,
            },
          );

          // Update student academic information
          const studentAcademic = await transactionalEntityManager.update(
            UserStudentAcademic,
            { id: updateData.userStudentAcademic.id },
            {
              fullName: updateData.userStudentAcademic.fullName,
              studentCode: updateData.userStudentAcademic.studentCode,
              academicYear: updateData.userStudentAcademic.academicYear,
              status: updateData.userStudentAcademic.status,
            },
          );

          // Return updated data
          return updateData;
        } catch (error) {
          // Check for specific errors
          if (error.code === '23505') {
            if (error.detail.includes('email')) {
              throw new Error('Email already exists');
            }
            if (error.detail.includes('studentCode')) {
              throw new Error('Student code already exists');
            }
          }
          throw new Error(`Failed to update student: ${error.message}`);
        }
      },
    );
  }

  async deleteStudentAcademic(userId: number): Promise<void> {
    return this.userRepository.manager.transaction(
      async (transactionalEntityManager) => {
        try {
          await transactionalEntityManager.delete(UserStudentAcademic, {
            userId: userId,
          });

          const remainingAcademics = await transactionalEntityManager.count(
            UserStudentAcademic,
            {
              where: { userId },
            },
          );

          if (remainingAcademics === 0) {
            const user = await transactionalEntityManager.findOne(User, {
              where: { id: userId },
            });
            await transactionalEntityManager.delete(User, { id: userId });
          }
        } catch (error) {
          throw new Error(
            `Failed to delete student academic record for user ${userId}: ${error.message}`,
          );
        }
      },
    );
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

  // Optional: Add a method to check for existing users before creation
  private async checkExistingUsers(emails: string[]): Promise<string[]> {
    const existingUsers = await this.userRepository.find({
      where: emails.map((email) => ({ email })),
      select: ['email'],
    });

    return existingUsers.map((user) => user.email);
  }
}
