import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from 'src/entities/Course';
import { Repository } from 'typeorm';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async findAll(): Promise<Course[]> {
    return await this.courseRepository.find({
      relations: {
        category: true,
        instructor: {
          user: true,
        },
        sections: {
          lessons: {
            assignments: true,
          },
          documents: true,
        },
        reviews: true,
        enrollments: true,
      },
      select: {
        instructor: {
          id: true,
          fullName: true,
          professionalTitle: true,
          user: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
            role: true,
          },
        },
        category: {
          id: true,
          name: true,
          description: true,
        },
        enrollments: {
          userId: true,
        },
      },
    });
  }

  async findOne(id: number): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: {
        category: true,
        instructor: {
          user: true,
          courses: true,
        },
        sections: {
          lessons: {
            assignments: true,
          },
          documents: true,
        },
        reviews: true,
        enrollments: true,
      },
      select: {
        instructor: {
          id: true,
          fullName: true,
          professionalTitle: true,
          bio: true,
          specialization: true,
          user: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
            role: true,
          },
          courses: {
            id: true,
          },
        },
        category: {
          id: true,
          name: true,
          description: true,
        },
        enrollments: {
          id: true,
        },
      },
    });
    if (!course) {
      throw new NotFoundException('không tìm thấy khóa học !');
    }
    return course;
  }

  async findCoursesByInstructor(instructorId: number): Promise<Course[]> {
    return await this.courseRepository.find({
      where: { instructor: { id: instructorId } },
    });
  }

  async create(course: any): Promise<Course> {
    this.courseRepository.create(course);
    return this.courseRepository.save(course);
  }

  async update(id: number, course: any): Promise<Course | null> {
    await this.courseRepository.update(id, course);
    return this.courseRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<{ message: string }> {
    const result = await this.courseRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('không tìm thấy khóa học !');
    }
    return {
      message: 'khóa học đã được xóa thành công !',
    };
  }
}
