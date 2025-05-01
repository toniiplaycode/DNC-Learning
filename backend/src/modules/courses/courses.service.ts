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

  // Add this helper function at the top of the class
  private formatDate(date: string | Date | null): string | null {
    if (!date) return null;
    const d = new Date(date);
    return (
      d.getFullYear() +
      '-' +
      String(d.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(d.getDate()).padStart(2, '0')
    );
  }

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
        reviews: {
          student: {
            user: true,
          },
        },
        enrollments: {
          user: true,
        },
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
          id: true,
          userId: true,
          enrollmentDate: true,
          status: true,
          user: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
          },
        },
        reviews: {
          id: true,
          rating: true,
          reviewText: true,
          createdAt: true,
          student: {
            id: true,
            fullName: true,
            user: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
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
      order: {
        sections: {
          orderNumber: 'ASC', // Sort sections by orderNumber ascending
          lessons: {
            orderNumber: 'ASC', // Sort lessons by orderNumber ascending
          },
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
      where: {
        instructor: {
          id: instructorId, // Lọc theo instructorId
        },
      },
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

  async create(course: any): Promise<any> {
    // Format dates before saving
    const formattedCourse = {
      ...course,
      startDate: this.formatDate(course.startDate),
      endDate: this.formatDate(course.endDate),
    };

    const newCourse = this.courseRepository.create(formattedCourse);
    return this.courseRepository.save(newCourse);
  }

  async update(id: number, course: any): Promise<Course | null> {
    // Format dates before updating
    const formattedCourse = {
      ...course,
      startDate: this.formatDate(course.startDate),
      endDate: this.formatDate(course.endDate),
    };

    await this.courseRepository.update(id, formattedCourse);
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
