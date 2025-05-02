import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole, UserStatus } from 'src/entities/User';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserStudentAcademic } from '../../entities/UserStudentAcademic';
import { AcademicClass } from '../../entities/AcademicClass';
import { AcademicClassCourse } from '../../entities/AcademicClassCourse';
import { AcademicClassInstructor } from 'src/entities/AcademicClassInstructor';
import {
  UserInstructor,
  VerificationStatus,
} from 'src/entities/UserInstructor';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateInstructorDto } from './dto/update-instructor.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { UserStudent } from 'src/entities/UserStudent';
import { CreateInstructorData } from './dto/create-instructor.dto';
import { Notification } from 'src/entities/Notification';

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
    @InjectRepository(UserStudent)
    private userStudent: Repository<UserStudent>,
    @InjectRepository(UserStudentAcademic)
    private userStudentAcademic: Repository<UserStudentAcademic>,
    @InjectRepository(AcademicClass)
    private academicClass: Repository<AcademicClass>,
    @InjectRepository(AcademicClassCourse)
    private academicClassCourse: Repository<AcademicClassCourse>,
    @InjectRepository(AcademicClassInstructor)
    private academicClassInstructor: Repository<AcademicClassInstructor>,
    @InjectRepository(UserInstructor)
    private userInstructorRepository: Repository<UserInstructor>,
    @InjectRepository(Notification)
    private notification: Repository<Notification>,
    private dataSource: DataSource,
  ) {}
  findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: [
        'userStudent',
        'userStudentAcademic',
        'userStudentAcademic.academicClass',
        'userInstructor',
      ],
      order: {
        createdAt: 'DESC',
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

  async findStudentAcademicByInstructorId(
    instructorId: number,
  ): Promise<User[]> {
    const students = await this.userRepository
      .createQueryBuilder('user')
      .innerJoin(
        'user_students_academic',
        'userStudentAcademic',
        'user.id = userStudentAcademic.user_id',
      )
      .innerJoin(
        'academic_classes',
        'academicClass',
        'userStudentAcademic.academic_class_id = academicClass.id',
      )
      .innerJoin(
        'academic_class_instructors',
        'classInstructor',
        'academicClass.id = classInstructor.class_id',
      )
      .innerJoin(
        'user_instructors',
        'instructor',
        'classInstructor.instructor_id = instructor.id',
      )
      .where('instructor.id = :instructorId', { instructorId })
      .andWhere('user.role = :role', { role: 'student_academic' })

      // Join và select các thông tin cần thiết
      .leftJoinAndSelect('user.userStudentAcademic', 'studentAcademic')
      .leftJoinAndSelect('studentAcademic.academicClass', 'class')
      .leftJoinAndSelect('class.classCourses', 'classCourses')
      .leftJoinAndSelect('classCourses.course', 'course')

      // Join với bảng user_grades và lấy thông tin điểm số
      .leftJoinAndSelect('user.userGrades', 'userGrades')
      .leftJoinAndSelect('userGrades.lesson', 'lesson')
      .leftJoinAndSelect('userGrades.course', 'gradeCourse')

      // Join với bảng assignment submissions
      .leftJoinAndSelect(
        'userGrades.assignmentSubmission',
        'assignmentSubmission',
        'userGrades.assignment_submission_id = assignmentSubmission.id',
      )
      .leftJoinAndSelect('assignmentSubmission.assignment', 'assignment')

      // Join với bảng quiz attempts
      .leftJoinAndSelect(
        'userGrades.quizAttempt',
        'quizAttempt',
        'userGrades.quiz_attempt_id = quizAttempt.id',
      )
      .leftJoinAndSelect('quizAttempt.quiz', 'quiz')

      .distinct(true)
      .orderBy({
        'class.className': 'ASC',
        'studentAcademic.studentCode': 'ASC',
      })
      .getMany();

    return students;
  }

  async findById(id: number): Promise<User | null> {
    if (!id || isNaN(id)) {
      throw new BadRequestException('Invalid user ID provided');
    }
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

  async findAcademicClassCoursesByStudentAcademicId(
    studentAcademicId: number,
  ): Promise<AcademicClassCourse[]> {
    try {
      // First find the student academic to get their class
      const studentAcademic = await this.userStudentAcademic.findOne({
        where: { userId: studentAcademicId },
        relations: ['academicClass'],
      });

      if (!studentAcademic) {
        throw new NotFoundException('Student academic not found');
      }

      // Find all courses for that academic class using query builder
      const academicClassCourses = await this.userRepository.manager
        .createQueryBuilder(AcademicClassCourse, 'academicClassCourse')
        .leftJoinAndSelect('academicClassCourse.course', 'course')
        .leftJoinAndSelect('course.instructor', 'instructor')
        .leftJoinAndSelect('course.category', 'category')
        .leftJoinAndSelect('course.sections', 'sections')
        .leftJoinAndSelect('sections.lessons', 'lessons')
        .leftJoinAndSelect('academicClassCourse.academicClass', 'academicClass') // Add this line
        .leftJoinAndSelect('academicClass.instructors', 'classInstructors') // Add this line if needed
        .where('academicClassCourse.classId = :classId', {
          classId: studentAcademic.academicClassId,
        })
        .orderBy({
          'course.createdAt': 'DESC',
          'sections.orderNumber': 'ASC',
          'lessons.orderNumber': 'ASC',
        })
        .getMany();

      // Add student's academic class info to response
      return academicClassCourses.map((course) => ({
        ...course,
        academicClass: studentAcademic.academicClass, // Ensure consistent class info
      }));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(
        `Failed to get academic class courses for student ${studentAcademicId}: ${error.message}`,
      );
    }
  }

  async findStudentsByAcademicClassId(
    academicClassId: number,
  ): Promise<UserStudentAcademic[]> {
    try {
      const students = await this.userStudentAcademic
        .createQueryBuilder('studentAcademic')
        .leftJoinAndSelect('studentAcademic.user', 'user')
        .leftJoinAndSelect('studentAcademic.academicClass', 'academicClass')
        .where('studentAcademic.academicClassId = :academicClassId', {
          academicClassId,
        })
        .orderBy({
          'user.username': 'ASC',
        })
        .getMany();

      if (!students.length) {
        throw new NotFoundException(
          `No students found for academic class ${academicClassId}`,
        );
      }

      return students;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(
        `Failed to get students for academic class: ${error.message}`,
      );
    }
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Verify new password and confirm password match
    if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
      throw new BadRequestException(
        'New password and confirm password do not match',
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    user.password = hashedPassword;

    await this.userRepository.save(user);
    return { message: 'Password changed successfully' };
  }

  async updateInstructorProfile(
    userId: number,
    updateData: {
      user: UpdateUserDto;
      instructor: UpdateInstructorDto;
    },
  ) {
    if (!userId || isNaN(userId)) {
      throw new BadRequestException('Invalid user ID provided');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['userInstructor'],
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      if (!user.userInstructor) {
        throw new NotFoundException(
          `Instructor profile not found for user ${userId}`,
        );
      }

      // Check for duplicate email if email is being updated
      if (updateData.user.email && updateData.user.email !== user.email) {
        const existingUser = await this.userRepository.findOne({
          where: { email: updateData.user.email },
        });
        if (existingUser) {
          throw new BadRequestException('Email already exists');
        }
      }

      // Update user data
      if (updateData.user) {
        const allowedUserFields: (keyof UpdateUserDto)[] = [
          'username',
          'email',
          'phone',
          'avatarUrl',
          'twoFactorEnabled',
        ];

        allowedUserFields.forEach((field) => {
          if (updateData.user[field] !== undefined) {
            (user as any)[field] = updateData.user[field];
          }
        });

        await queryRunner.manager.save(User, user);
      }

      // Update instructor data
      if (updateData.instructor) {
        Object.assign(user.userInstructor, updateData.instructor);
        await queryRunner.manager.save(UserInstructor, user.userInstructor);
      }

      await queryRunner.commitTransaction();

      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          role: user.role,
          status: user.status,
          twoFactorEnabled: user.twoFactorEnabled,
        },
        instructor: user.userInstructor,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateStudentProfile(
    userId: number,
    updateData: {
      user: UpdateUserDto;
      student: UpdateStudentDto;
    },
  ) {
    if (!userId || isNaN(userId)) {
      throw new BadRequestException('Invalid user ID provided');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['userStudent'],
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      if (!user.userStudent) {
        throw new NotFoundException(
          `Student profile not found for user ${userId}`,
        );
      }

      // Update user data
      if (updateData.user) {
        const allowedUserFields: (keyof UpdateUserDto)[] = [
          'username',
          'email',
          'phone',
          'avatarUrl',
          'twoFactorEnabled',
        ];

        allowedUserFields.forEach((field) => {
          if (updateData.user[field] !== undefined) {
            (user as any)[field] = updateData.user[field];
          }
        });

        await queryRunner.manager.save(User, user);
      }

      // Update student data
      if (updateData.student) {
        Object.assign(user.userStudent, updateData.student);
        await queryRunner.manager.save(UserStudent, user.userStudent);
      }

      await queryRunner.commitTransaction();

      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          role: user.role,
          status: user.status,
          twoFactorEnabled: user.twoFactorEnabled,
        },
        student: user.userStudent,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to update student profile: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  async createInstructor(
    data: CreateInstructorData,
  ): Promise<{ user: User; instructor: UserInstructor }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check for duplicate email
      const existingUser = await this.userRepository.findOne({
        where: { email: data.user.email },
      });
      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }

      // 1. Create user
      const hashedPassword = await bcrypt.hash(data.user.password, 10);
      const newUser = this.userRepository.create({
        ...data.user,
        password: hashedPassword,
        role: data.user.role || UserRole.INSTRUCTOR,
        status: data.user.status || UserStatus.ACTIVE,
      });

      const savedUser = await queryRunner.manager.save(User, newUser);

      // 2. Create instructor profile
      const newInstructor = this.userInstructorRepository.create({
        userId: savedUser.id,
        fullName: data.instructor.fullName,
        professionalTitle: data.instructor.professionalTitle,
        specialization: data.instructor.specialization,
        educationBackground: data.instructor.educationBackground,
        teachingExperience: data.instructor.teachingExperience,
        bio: data.instructor.bio,
        expertiseAreas: data.instructor.expertiseAreas,
        certificates: data.instructor.certificates,
        linkedinProfile: data.instructor.linkedinProfile,
        website: data.instructor.website,
        verificationStatus: data.instructor.verificationStatus,
        verificationDocuments: data.instructor.verificationDocuments,
      });

      const savedInstructor = await queryRunner.manager.save(
        UserInstructor,
        newInstructor,
      );

      // 3. Update user with instructor relation
      savedUser.userInstructor = savedInstructor;
      await queryRunner.manager.save(User, savedUser);

      await queryRunner.commitTransaction();

      return {
        user: savedUser,
        instructor: savedInstructor,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      // Check for specific errors
      if (error.code === '23505') {
        if (error.detail.includes('email')) {
          throw new BadRequestException('Email already exists');
        }
        if (error.detail.includes('username')) {
          throw new BadRequestException('Username already exists');
        }
      }

      throw new Error(`Failed to create instructor: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  async deleteInstructor(userId: number): Promise<void> {
    if (!userId || isNaN(userId)) {
      throw new BadRequestException('Invalid user ID provided');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Tìm user và instructor
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
        relations: ['userInstructor'],
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      if (!user.userInstructor) {
        throw new NotFoundException(
          `Instructor profile not found for user ${userId}`,
        );
      }

      // Xóa instructor profile trước
      await queryRunner.manager.delete(UserInstructor, {
        userId: user.id,
      });

      // Sau đó xóa user
      await queryRunner.manager.delete(User, {
        id: user.id,
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(`Failed to delete instructor: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  async findAllStudents() {
    try {
      const students = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.userStudent', 'userStudent')
        .leftJoinAndSelect('user.enrollments', 'enrollments')
        .leftJoinAndSelect('enrollments.course', 'course')
        .leftJoinAndSelect('course.instructor', 'instructor')
        .leftJoinAndSelect('course.category', 'category')
        .leftJoinAndSelect('user.userGrades', 'userGrades')
        .leftJoinAndSelect(
          'userGrades.assignmentSubmission',
          'assignmentSubmission',
        )
        .leftJoinAndSelect('assignmentSubmission.assignment', 'assignment')
        .leftJoinAndSelect('userGrades.quizAttempt', 'quizAttempt')
        .leftJoinAndSelect('quizAttempt.quiz', 'quiz')
        .where('user.role = :role', { role: UserRole.STUDENT })
        .orderBy('user.createdAt', 'DESC')
        .getMany();

      return students;
    } catch (error) {
      throw new Error(`Failed to get students: ${error.message}`);
    }
  }

  async findAllStudentAcademics() {
    try {
      const students = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.userStudentAcademic', 'userStudentAcademic')
        .leftJoinAndSelect('userStudentAcademic.academicClass', 'academicClass')
        .leftJoinAndSelect('user.userGrades', 'userGrades')
        .leftJoinAndSelect(
          'userGrades.assignmentSubmission',
          'assignmentSubmission',
        )
        .leftJoinAndSelect('assignmentSubmission.assignment', 'assignment')
        .leftJoinAndSelect('userGrades.quizAttempt', 'quizAttempt')
        .leftJoinAndSelect('quizAttempt.quiz', 'quiz')
        .where('user.role = :role', { role: UserRole.STUDENT_ACADEMIC })
        .orderBy('userStudentAcademic.studentCode', 'ASC')
        .getMany();

      return students;
    } catch (error) {
      throw new Error(`Failed to get academic students: ${error.message}`);
    }
  }

  async deleteUser(userId: number): Promise<void> {
    if (!userId || isNaN(userId)) {
      throw new BadRequestException('Invalid user ID provided');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find the user with all relations
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: [
          'userStudent',
          'userStudentAcademic',
          'userInstructor',
          'enrollments',
          'userGrades',
        ],
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Check if user has any enrolled courses
      if (user.enrollments && user.enrollments.length > 0) {
        throw new BadRequestException(
          'Cannot delete user with enrolled courses',
        );
      }

      // Check if user has any grades
      if (user.userGrades && user.userGrades.length > 0) {
        throw new BadRequestException('Cannot delete user with grades');
      }

      // Delete notifications first using repository
      await this.notification.delete({ userId: userId });

      // Delete student records if they exist
      if (user.userStudent) {
        await queryRunner.manager.delete(UserStudent, {
          userId: user.id,
        });
      }

      if (user.userStudentAcademic) {
        await queryRunner.manager.delete(UserStudentAcademic, {
          userId: user.id,
        });
      }

      // Delete instructor record if it exists
      if (user.userInstructor) {
        await queryRunner.manager.delete(UserInstructor, {
          userId: user.id,
        });
      }

      // Delete the user
      await queryRunner.manager.delete(User, {
        id: user.id,
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new Error(`Failed to delete user: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }
}
