import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseProgress } from '../../entities/CourseProgress';

@Injectable()
export class CourseProgressService {
  constructor(
    @InjectRepository(CourseProgress)
    private courseProgressRepository: Repository<CourseProgress>,
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
}
