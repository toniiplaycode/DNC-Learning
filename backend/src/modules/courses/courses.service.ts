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
        instructor: true,
        sections: {
          lessons: true,
          documents: true,
        },
        documents: true,
      },
      select: {
        instructor: {
          id: true,
          username: true,
          email: true,
          avatarUrl: true,
          role: true,
        },
        category: {
          id: true,
          name: true,
          description: true,
        },
      },
      order: {
        createdAt: 'DESC',
        sections: {
          orderNumber: 'ASC',
          lessons: {
            orderNumber: 'ASC',
          },
          documents: {
            orderNumber: 'ASC',
          },
        },
        documents: {
          orderNumber: 'ASC',
        },
      },
    });
  }

  async findOne(id: number): Promise<Course | null> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: {
        category: true,
        instructor: true,
        sections: {
          lessons: true,
          documents: {
            document: true,
          },
        },
        documents: {
          document: true,
        },
      },
      select: {
        instructor: {
          id: true,
          username: true,
          email: true,
          avatarUrl: true,
          role: true,
        },
        category: {
          id: true,
          name: true,
          description: true,
        },
      },
      order: {
        sections: {
          orderNumber: 'ASC',
          lessons: {
            orderNumber: 'ASC',
          },
          documents: {
            orderNumber: 'ASC',
          },
        },
        documents: {
          orderNumber: 'ASC',
        },
      },
    });
    if (!course) {
      throw new NotFoundException('không tìm thấy khóa học !');
    }
    return course;
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
