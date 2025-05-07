import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CourseProgress } from '../../entities/CourseProgress';
import { CourseLesson } from '../../entities/CourseLesson';
import { CourseSection } from '../../entities/CourseSection';
import { Course } from '../../entities/Course';

interface CourseProgressSummary {
  courseId: number;
  courseTitle: string;
  courseImage: string;
  totalLessons: number;
  completedLessons: number;
  completionPercentage: number;
  lastAccessedLesson: {
    id: number;
    title: string;
  } | null;
  lastAccessTime: Date | null;
}

@Injectable()
export class CourseProgressService {
  constructor(
    @InjectRepository(CourseProgress)
    private courseProgressRepository: Repository<CourseProgress>,
    @InjectRepository(CourseLesson)
    private courseLessonRepository: Repository<CourseLesson>,
    @InjectRepository(CourseSection)
    private courseSectionRepository: Repository<CourseSection>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  async create(userId: number, lessonId: number): Promise<CourseProgress> {
    const progress = this.courseProgressRepository.create({
      userId,
      lessonId,
      completedAt: new Date(),
      lastAccessed: new Date(),
    });
    return this.courseProgressRepository.save(progress);
  }

  async updateLastAccessed(id: number): Promise<CourseProgress> {
    const progress = await this.courseProgressRepository.findOne({
      where: { id },
    });
    if (!progress) {
      throw new NotFoundException(`Course progress with ID ${id} not found`);
    }
    progress.lastAccessed = new Date();
    return this.courseProgressRepository.save(progress);
  }

  async markAsCompleted(id: number): Promise<CourseProgress> {
    const progress = await this.courseProgressRepository.findOne({
      where: { id },
    });
    if (!progress) {
      throw new NotFoundException(`Course progress with ID ${id} not found`);
    }
    progress.completedAt = new Date();
    return this.courseProgressRepository.save(progress);
  }

  async findByUserAndLesson(
    userId: number,
    lessonId: number,
  ): Promise<CourseProgress> {
    const progress = await this.courseProgressRepository.findOne({
      where: { userId, lessonId },
    });
    if (!progress) {
      throw new NotFoundException(
        `Course progress not found for user ${userId} and lesson ${lessonId}`,
      );
    }
    return progress;
  }

  async findByUser(userId: number): Promise<CourseProgress[]> {
    return this.courseProgressRepository.find({
      where: { userId },
      relations: ['lesson'],
    });
  }

  async delete(id: number): Promise<void> {
    const result = await this.courseProgressRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Course progress with ID ${id} not found`);
    }
  }

  async getUserCourseProgress(
    userId: number,
  ): Promise<CourseProgressSummary[]> {
    // Get all progress records for this user with related lesson and section data
    const progressRecords = await this.courseProgressRepository.find({
      where: { userId },
      relations: ['lesson', 'lesson.section', 'lesson.section.course'],
      order: { lastAccessed: 'DESC' },
    });

    // Group progress records by course
    const courseProgressMap = new Map();
    const courseIds = new Set<number>();

    for (const progress of progressRecords) {
      if (
        !progress.lesson ||
        !progress.lesson.section ||
        !progress.lesson.section.course
      )
        continue;

      const courseId = progress.lesson.section.courseId;
      // Skip if courseId is not a valid number
      if (isNaN(courseId) || courseId <= 0) continue;

      const course = progress.lesson.section.course;

      courseIds.add(courseId);

      if (!courseProgressMap.has(courseId)) {
        courseProgressMap.set(courseId, {
          courseId,
          courseTitle: course.title,
          courseImage: course.thumbnailUrl,
          progressRecords: [],
          lastAccessedLesson: null,
          lastAccessTime: null,
        });
      }

      const courseData = courseProgressMap.get(courseId);
      courseData.progressRecords.push(progress);

      // Update last accessed if this is the most recent record for this course
      if (
        !courseData.lastAccessTime ||
        progress.lastAccessed > courseData.lastAccessTime
      ) {
        courseData.lastAccessedLesson = {
          id: progress.lesson.id,
          title: progress.lesson.title,
        };
        courseData.lastAccessTime = progress.lastAccessed;
      }
    }

    // Get total lesson counts for each course
    const courseLessonCounts = new Map();

    if (courseIds.size > 0) {
      // For each course, count the total number of lessons
      for (const courseId of courseIds) {
        try {
          const lessonCount = await this.courseLessonRepository
            .createQueryBuilder('lesson')
            .innerJoin('lesson.section', 'section')
            .where('section.courseId = :courseId', { courseId })
            .getCount();

          courseLessonCounts.set(courseId, lessonCount);
        } catch (error) {
          console.error(
            `Error getting lesson count for course ${courseId}:`,
            error.message,
          );
          // Set a default value if query fails
          courseLessonCounts.set(courseId, 0);
        }
      }
    }

    // Process the data and calculate progress metrics
    const result: CourseProgressSummary[] = [];

    for (const [courseId, courseData] of courseProgressMap.entries()) {
      // Count completed lessons
      const completedLessons = courseData.progressRecords.filter(
        (p) => p.completedAt,
      ).length;

      // Get total lessons for this course
      const totalLessons = courseLessonCounts.get(courseId) || 0;

      // Calculate completion percentage
      const completionPercentage =
        totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100 * 100) / 100
          : 0;

      result.push({
        courseId,
        courseTitle: courseData.courseTitle,
        courseImage: courseData.courseImage,
        totalLessons,
        completedLessons,
        completionPercentage,
        lastAccessedLesson: courseData.lastAccessedLesson,
        lastAccessTime: courseData.lastAccessTime,
      });
    }

    return result;
  }

  async getCourseProgressDetail(userId: number, courseId: number) {
    if (isNaN(userId) || userId <= 0) {
      throw new Error('Invalid user ID');
    }
    if (isNaN(courseId) || courseId <= 0) {
      throw new Error('Invalid course ID');
    }

    // 1. Verify course exists
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    // 2. Get all sections in the course
    const sections = await this.courseSectionRepository.find({
      where: { courseId },
      order: { orderNumber: 'ASC' },
      relations: ['lessons'],
    });

    if (!sections.length) {
      throw new NotFoundException(`No content found for course ID ${courseId}`);
    }

    // 3. Get all lesson IDs in the course
    const lessonIds = sections.flatMap((section) =>
      section.lessons.map((lesson) => lesson.id),
    );

    // 4. Get user's progress for all lessons in the course
    const progressRecords = await this.courseProgressRepository.find({
      where: {
        userId,
        lessonId: In(lessonIds.length > 0 ? lessonIds : [0]), // Prevent empty IN clause
      },
      relations: ['lesson'],
    });

    // 5. Create a map for quick access to progress records
    const progressMap = new Map();
    progressRecords.forEach((record) => {
      progressMap.set(record.lessonId, record);
    });

    // 6. Generate detailed section progress
    const sectionProgress = sections.map((section) => {
      // Process each lesson with its progress data
      const lessonsWithProgress = section.lessons.map((lesson) => {
        const progress = progressMap.get(lesson.id);
        return {
          lessonId: lesson.id,
          title: lesson.title,
          orderNumber: lesson.orderNumber,
          contentType: lesson.contentType,
          duration: lesson.duration,
          isFree: lesson.isFree,
          completed: progress?.completedAt ? true : false,
          lastAccessed: progress?.lastAccessed || null,
          progressId: progress?.id || null,
        };
      });

      // Sort lessons by order number
      lessonsWithProgress.sort((a, b) => a.orderNumber - b.orderNumber);

      // Calculate completion stats for this section
      const completedLessons = lessonsWithProgress.filter(
        (lesson) => lesson.completed,
      ).length;

      return {
        sectionId: section.id,
        title: section.title,
        description: section.description,
        orderNumber: section.orderNumber,
        totalLessons: section.lessons.length,
        completedLessons,
        completionPercentage:
          section.lessons.length > 0
            ? Math.round(
                (completedLessons / section.lessons.length) * 100 * 100,
              ) / 100
            : 0,
        lessons: lessonsWithProgress,
      };
    });

    // 7. Calculate overall course progress
    const totalLessons = lessonIds.length;
    const completedLessons = progressRecords.filter(
      (p) => p.completedAt,
    ).length;

    // Find the last accessed lesson
    const lastAccessedProgress =
      progressRecords.length > 0
        ? progressRecords.reduce((latest, current) => {
            if (!latest.lastAccessed) return current;
            if (!current.lastAccessed) return latest;
            return new Date(current.lastAccessed) >
              new Date(latest.lastAccessed)
              ? current
              : latest;
          })
        : null;

    const lastAccessedLesson = lastAccessedProgress?.lesson
      ? {
          id: lastAccessedProgress.lesson.id,
          title: lastAccessedProgress.lesson.title,
        }
      : null;

    // 8. Return the complete progress data
    return {
      courseId,
      courseTitle: course.title,
      courseImage: course.thumbnailUrl,
      totalLessons,
      completedLessons,
      completionPercentage:
        totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0,
      lastAccessedLesson,
      lastAccessTime: lastAccessedProgress?.lastAccessed || null,
      sections: sectionProgress,
    };
  }
}
