import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseSection } from '../../entities/CourseSection';
import { UpdateCourseSectionDto } from './dto/update-course-section.dto';
import { CreateCourseSectionDto } from './dto/create-course-section.dto';

@Injectable()
export class CourseSectionService {
  constructor(
    @InjectRepository(CourseSection)
    private readonly courseSectionRepository: Repository<CourseSection>,
  ) {}

  async create(
    createCourseSectionDto: CreateCourseSectionDto,
  ): Promise<CourseSection> {
    // Kiểm tra nếu position của phần học mới trùng với bất kỳ phần học nào
    const existingSections = await this.courseSectionRepository.find({
      where: { courseId: createCourseSectionDto.courseId },
    });

    const newPosition = createCourseSectionDto.orderNumber;

    // Nếu orderNumber trùng với một phần học cũ, cần cập nhật các phần học có orderNumber >= newPosition
    if (
      existingSections.some((section) => section.orderNumber >= newPosition)
    ) {
      // Cập nhật tất cả các phần học có orderNumber >= newPosition
      await this.courseSectionRepository
        .createQueryBuilder()
        .update(CourseSection)
        .set({
          orderNumber: () => 'orderNumber + 1', // Tăng orderNumber lên 1
        })
        .where('courseId = :courseId', {
          courseId: createCourseSectionDto.courseId,
        })
        .andWhere('orderNumber >= :orderNumber', { orderNumber: newPosition })
        .execute();
    }

    // Tạo phần học mới với orderNumber đã được xử lý
    const courseSection = this.courseSectionRepository.create(
      createCourseSectionDto,
    );

    // Lưu phần học mới vào cơ sở dữ liệu
    return await this.courseSectionRepository.save(courseSection);
  }

  async findAll(): Promise<CourseSection[]> {
    return await this.courseSectionRepository.find({
      relations: ['course', 'lessons', 'documents'],
    });
  }

  async findOne(id: number): Promise<CourseSection | undefined> {
    const courseSection = await this.courseSectionRepository.findOne({
      where: { id },
      relations: ['course', 'lessons', 'documents'],
    });
    return courseSection ?? undefined;
  }

  async findByCourseId(courseId: number): Promise<CourseSection[]> {
    return await this.courseSectionRepository.find({
      where: { courseId },
    });
  }

  async update(
    id: number,
    updateCourseSectionDto: UpdateCourseSectionDto,
  ): Promise<void> {
    // Get the current section
    const currentSection = await this.courseSectionRepository.findOne({
      where: { id: id },
    });

    if (!currentSection) {
      throw new Error('Phần học không tồn tại');
    }

    // If orderNumber is changing
    if (updateCourseSectionDto.orderNumber !== currentSection.orderNumber) {
      const oldPosition = currentSection.orderNumber;
      const newPosition = updateCourseSectionDto.orderNumber;

      if ((newPosition ?? 0) > oldPosition) {
        // Moving down: Update sections between old and new position
        await this.courseSectionRepository
          .createQueryBuilder()
          .update(CourseSection)
          .set({
            orderNumber: () => 'orderNumber - 1',
          })
          .where('courseId = :courseId', {
            courseId: currentSection.courseId,
          })
          .andWhere('orderNumber > :oldPosition', { oldPosition })
          .andWhere('orderNumber <= :newPosition', { newPosition })
          .execute();
      } else if ((newPosition ?? 0) < oldPosition) {
        // Moving up: Update sections between new and old position
        await this.courseSectionRepository
          .createQueryBuilder()
          .update(CourseSection)
          .set({
            orderNumber: () => 'orderNumber + 1',
          })
          .where('courseId = :courseId', {
            courseId: currentSection.courseId,
          })
          .andWhere('orderNumber >= :newPosition', { newPosition })
          .andWhere('orderNumber < :oldPosition', { oldPosition })
          .execute();
      }
    }

    // Update the section itself
    if (id === undefined) {
      throw new Error('ID is required for updating a course section');
    }
    await this.courseSectionRepository.update(id, updateCourseSectionDto);
  }

  async remove(id: number): Promise<void> {
    const sectionToDelete = await this.courseSectionRepository.findOne({
      where: { id },
    });
    if (!sectionToDelete) {
      throw new Error('Phần học không tồn tại');
    }
    const courseId = sectionToDelete.courseId;
    const orderNumberToDelete = sectionToDelete.orderNumber;
    await this.courseSectionRepository.delete(id);
    await this.courseSectionRepository
      .createQueryBuilder()
      .update(CourseSection)
      .set({
        orderNumber: () => 'orderNumber - 1',
      })
      .where('courseId = :courseId', { courseId })
      .andWhere('orderNumber > :orderNumberToDelete', { orderNumberToDelete })
      .execute();
  }
}
