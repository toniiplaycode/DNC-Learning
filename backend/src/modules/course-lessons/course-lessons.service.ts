import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ContentType, CourseLesson } from 'src/entities/CourseLesson';
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

  async findQuizzesByCourse(courseId: number): Promise<CourseLesson[]> {
    return this.courseLessonRepository
      .createQueryBuilder('lesson')
      .innerJoin('lesson.section', 'section')
      .where('section.courseId = :courseId', { courseId })
      .andWhere('lesson.contentType = :contentType', {
        contentType: ContentType.QUIZ,
      })
      .orderBy('lesson.orderNumber', 'ASC')
      .getMany();
  }

  async findAssignmentsByCourse(courseId: number): Promise<CourseLesson[]> {
    return this.courseLessonRepository
      .createQueryBuilder('lesson')
      .innerJoin('lesson.section', 'section')
      .where('section.courseId = :courseId', { courseId })
      .andWhere('lesson.contentType = :contentType', {
        contentType: ContentType.ASSIGNMENT,
      })
      .orderBy('lesson.orderNumber', 'ASC')
      .getMany();
  }

  async update(
    id: number,
    updatedCourseLesson: Partial<CourseLesson>,
  ): Promise<CourseLesson | null> {
    // Get the current lesson
    const currentLesson = await this.courseLessonRepository.findOne({
      where: { id },
    });

    if (!currentLesson) {
      throw new Error('Bài học không tồn tại');
    }

    // If only the orderNumber is changing within the same section
    if (
      updatedCourseLesson.orderNumber &&
      updatedCourseLesson.sectionId === currentLesson.sectionId
    ) {
      const oldOrderNumber = currentLesson.orderNumber;
      const newOrderNumber = updatedCourseLesson.orderNumber;

      if (newOrderNumber > oldOrderNumber) {
        // Moving down: Update lessons between old and new position
        await this.courseLessonRepository
          .createQueryBuilder()
          .update(CourseLesson)
          .set({
            orderNumber: () => 'orderNumber - 1',
          })
          .where('sectionId = :sectionId', {
            sectionId: currentLesson.sectionId,
          })
          .andWhere('orderNumber > :oldOrderNumber', { oldOrderNumber })
          .andWhere('orderNumber <= :newOrderNumber', { newOrderNumber })
          .execute();
      } else if (newOrderNumber < oldOrderNumber) {
        // Moving up: Update lessons between new and old position
        await this.courseLessonRepository
          .createQueryBuilder()
          .update(CourseLesson)
          .set({
            orderNumber: () => 'orderNumber + 1',
          })
          .where('sectionId = :sectionId', {
            sectionId: currentLesson.sectionId,
          })
          .andWhere('orderNumber >= :newOrderNumber', { newOrderNumber })
          .andWhere('orderNumber < :oldOrderNumber', { oldOrderNumber })
          .execute();
      }
    }

    // If sectionId is changing, we need to adjust orderNumbers in both sections
    if (
      updatedCourseLesson.sectionId &&
      updatedCourseLesson.sectionId !== currentLesson.sectionId
    ) {
      const oldSectionId = currentLesson.sectionId;
      const newSectionId = updatedCourseLesson.sectionId;

      // Update the old section's order numbers (decrease for all lessons after the deleted one)
      await this.courseLessonRepository
        .createQueryBuilder()
        .update(CourseLesson)
        .set({
          orderNumber: () => 'orderNumber - 1',
        })
        .where('sectionId = :oldSectionId', { oldSectionId })
        .andWhere('orderNumber > :currentOrderNumber', {
          currentOrderNumber: currentLesson.orderNumber,
        })
        .execute();

      // Update the new section's order numbers (increase for all lessons after the new one)
      await this.courseLessonRepository
        .createQueryBuilder()
        .update(CourseLesson)
        .set({
          orderNumber: () => 'orderNumber + 1',
        })
        .where('sectionId = :newSectionId', { newSectionId })
        .andWhere('orderNumber >= :newOrderNumber', {
          newOrderNumber: updatedCourseLesson.orderNumber,
        })
        .execute();
    }

    // Update the lesson itself
    await this.courseLessonRepository.update(id, updatedCourseLesson);

    // Return the updated lesson
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
