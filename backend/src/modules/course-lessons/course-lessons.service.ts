import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseLesson } from 'src/entities/CourseLesson';
import { Repository } from 'typeorm';

@Injectable()
export class CourseLessonsService {
  constructor(
    @InjectRepository(CourseLesson)
    private courseLessonRepository: Repository<CourseLesson>,
  ) {}

  async create(courseLesson: CourseLesson): Promise<CourseLesson> {
    // Step 1: Retrieve existing lessons in the same section
    const existingLessons = await this.courseLessonRepository.find({
      where: { sectionId: courseLesson.sectionId },
      order: { orderNumber: 'ASC' },
    });

    // Step 2: Adjust orderNumber for existing lessons if necessary
    const newPosition = courseLesson.orderNumber;
    if (existingLessons.some((lesson) => lesson.orderNumber >= newPosition)) {
      await this.courseLessonRepository
        .createQueryBuilder()
        .update(CourseLesson)
        .set({ orderNumber: () => 'orderNumber + 1' })
        .where('sectionId = :sectionId', { sectionId: courseLesson.sectionId })
        .andWhere('orderNumber >= :orderNumber', { orderNumber: newPosition })
        .execute();
    }

    // Step 3: Create and save the new lesson
    const newLesson = this.courseLessonRepository.create(courseLesson);
    return await this.courseLessonRepository.save(newLesson);
  }

  async findAll(): Promise<CourseLesson[]> {
    return this.courseLessonRepository.find();
  }

  async findOne(id: number): Promise<CourseLesson | null> {
    return this.courseLessonRepository.findOneBy({ id });
  }

  async update(
    id: number,
    updatedCourseLesson: Partial<CourseLesson>,
  ): Promise<CourseLesson | null> {
    await this.courseLessonRepository.update(id, updatedCourseLesson);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const lessonToDelete = await this.courseLessonRepository.findOne({
      where: { id },
    });

    if (!lessonToDelete) {
      throw new Error('Bài học không tồn tại');
    }

    const sectionId = lessonToDelete.sectionId;
    const orderNumberToDelete = lessonToDelete.orderNumber;

    // Delete the lesson
    await this.courseLessonRepository.delete(id);

    // Update the orderNumber of the remaining lessons in the same section
    await this.courseLessonRepository
      .createQueryBuilder()
      .update(CourseLesson)
      .set({
        orderNumber: () => 'orderNumber - 1',
      })
      .where('sectionId = :sectionId', { sectionId })
      .andWhere('orderNumber > :orderNumberToDelete', { orderNumberToDelete })
      .execute();
  }
}
