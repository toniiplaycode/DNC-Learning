import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  UserInstructor,
  VerificationStatus,
} from '../../entities/UserInstructor';
import { CreateUserInstructorDto } from './dto/create-user-instructor.dto';
import { UpdateUserInstructorDto } from './dto/update-user-instructor.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class UserInstructorsService {
  constructor(
    @InjectRepository(UserInstructor)
    private userInstructorRepository: Repository<UserInstructor>,
    private usersService: UsersService,
  ) {}

  async findAll(): Promise<UserInstructor[]> {
    try {
      // Lấy danh sách instructors với thông tin user
      const instructors = await this.userInstructorRepository.find({
        relations: {
          user: true,
        },
        select: {
          user: {
            id: true,
            username: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
      });

      // Lấy rating trung bình cho tất cả instructors trong một lần query
      const statistical = await this.userInstructorRepository.query(`
        SELECT 
          c.instructor_id,
          AVG(r.rating) as average_rating,
          COUNT(DISTINCT r.id) as total_reviews,
          COUNT(DISTINCT c.id) as total_courses,
          COUNT(DISTINCT e.id) as total_students
        FROM user_instructors ui
        LEFT JOIN courses c ON c.instructor_id = ui.id
        LEFT JOIN reviews r ON r.course_id = c.id
        LEFT JOIN enrollments e ON e.course_id = c.id
        GROUP BY c.instructor_id
      `);

      // Kết hợp thông tin
      const instructorsWithStats = instructors.map((instructor) => {
        const stats = statistical.find(
          (r) => r.instructor_id === instructor.id,
        ) || {
          average_rating: 0,
          total_reviews: 0,
          total_courses: 0,
          total_students: 0,
        };

        return {
          ...instructor,
          averageRating: Number(stats.average_rating || 0).toFixed(1),
          totalReviews: Number(stats.total_reviews || 0),
          totalCourses: Number(stats.total_courses || 0),
          totalStudents: Number(stats.total_students || 0),
        };
      });

      return instructorsWithStats;
    } catch (error) {
      throw new Error(`Failed to fetch instructors: ${error.message}`);
    }
  }

  async findOne(id: number): Promise<UserInstructor> {
    try {
      // Lấy thông tin instructor và user
      const instructor = await this.userInstructorRepository.findOne({
        where: { id },
        relations: {
          user: true,
          courses: {
            sections: {
              lessons: true,
            },
            reviews: true,
          },
        },
        select: {
          user: {
            id: true,
            username: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
      });

      if (!instructor) {
        throw new NotFoundException(`Instructor with ID ${id} not found`);
      }

      // Lấy các thống kê cho instructor cụ thể
      const [stats] = await this.userInstructorRepository.query(
        `
        SELECT 
          c.instructor_id,
          AVG(r.rating) as average_rating,
          COUNT(DISTINCT r.id) as total_reviews,
          COUNT(DISTINCT c.id) as total_courses,
          COUNT(DISTINCT e.id) as total_students
        FROM user_instructors ui
        LEFT JOIN courses c ON c.instructor_id = ui.id
        LEFT JOIN reviews r ON r.course_id = c.id
        LEFT JOIN enrollments e ON e.course_id = c.id
        WHERE ui.id = ?
      `,
        [id],
      );

      // Kết hợp thông tin
      return {
        ...instructor,
        ...{
          averageRating: Number(stats.average_rating || 0).toFixed(1),
          totalReviews: Number(stats.total_reviews || 0),
          totalCourses: Number(stats.total_courses || 0),
          totalStudents: Number(stats.total_students || 0),
        },
      } as UserInstructor;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to fetch instructor: ${error.message}`);
    }
  }

  async findByUserId(userId: number): Promise<UserInstructor> {
    const instructor = await this.userInstructorRepository.findOne({
      where: { userId },
      relations: {
        user: true,
      },
    });

    if (!instructor) {
      throw new NotFoundException(
        `Không tìm thấy giảng viên với User ID ${userId}`,
      );
    }

    return instructor;
  }

  async create(
    createUserInstructorDto: CreateUserInstructorDto,
  ): Promise<UserInstructor> {
    // Kiểm tra xem user có tồn tại không
    await this.usersService.findById(createUserInstructorDto.userId);

    // Kiểm tra xem user đã là instructor chưa
    const existingInstructor = await this.userInstructorRepository.findOne({
      where: { userId: createUserInstructorDto.userId },
    });

    if (existingInstructor) {
      throw new Error(
        `User với ID ${createUserInstructorDto.userId} đã là giảng viên`,
      );
    }

    const newInstructor = this.userInstructorRepository.create(
      createUserInstructorDto,
    );
    return this.userInstructorRepository.save(newInstructor);
  }

  async update(
    id: number,
    updateUserInstructorDto: UpdateUserInstructorDto,
  ): Promise<UserInstructor> {
    const instructor = await this.findOne(id);

    // Cập nhật thông tin
    Object.assign(instructor, updateUserInstructorDto);

    return this.userInstructorRepository.save(instructor);
  }

  async remove(id: number): Promise<void> {
    const instructor = await this.findOne(id);
    await this.userInstructorRepository.remove(instructor);
  }

  async verifyInstructor(id: number): Promise<UserInstructor> {
    const instructor = await this.findOne(id);
    instructor.verificationStatus = VerificationStatus.VERIFIED;
    return this.userInstructorRepository.save(instructor);
  }

  async rejectInstructor(id: number): Promise<UserInstructor> {
    const instructor = await this.findOne(id);
    instructor.verificationStatus = VerificationStatus.REJECTED;
    return this.userInstructorRepository.save(instructor);
  }
}
