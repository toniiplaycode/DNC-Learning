import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizAttempt, AttemptStatus } from '../../entities/QuizAttempt';
import { Quiz } from '../../entities/Quiz';
import { Equal } from 'typeorm';

@Injectable()
export class QuizAttemptsService {
  constructor(
    @InjectRepository(QuizAttempt)
    private quizAttemptsRepository: Repository<QuizAttempt>,
    @InjectRepository(Quiz)
    private quizzesRepository: Repository<Quiz>,
  ) {}

  async findAllByUserId(userId: number): Promise<QuizAttempt[]> {
    return this.quizAttemptsRepository.find({
      where: {
        userId: Equal(userId),
      },
      relations: [
        'quiz',
        'quiz.questions',
        'quiz.academicClass',
        'responses',
        'responses.question',
        'responses.selectedOption',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: number): Promise<QuizAttempt> {
    const attempt = await this.quizAttemptsRepository.findOne({
      where: { id },
      relations: [
        'quiz',
        'quiz.questions',
        'quiz.questions.options',
        'responses',
        'responses.question',
        'responses.selectedOption',
      ],
    });

    if (!attempt) {
      throw new NotFoundException(`Quiz attempt with ID ${id} not found`);
    }

    return attempt;
  }

  async create(userId: number, quizId: number): Promise<QuizAttempt> {
    const quiz = await this.quizzesRepository.findOne({
      where: { id: quizId },
      relations: ['questions'],
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${quizId} not found`);
    }

    const attempt = this.quizAttemptsRepository.create({
      userId,
      quizId,
      startTime: new Date(),
      status: AttemptStatus.IN_PROGRESS,
    });

    const savedAttempt = await this.quizAttemptsRepository.save(attempt);
    return Array.isArray(savedAttempt) ? savedAttempt[0] : savedAttempt;
  }

  async completeAttempt(attemptId: number): Promise<QuizAttempt> {
    const attempt = await this.findById(attemptId);

    // Calculate score
    const totalPoints = attempt.quiz.questions.reduce(
      (sum, q) => sum + q.points,
      0,
    );
    const earnedPoints = attempt.responses.reduce(
      (sum, r) => sum + (r.score || 0),
      0,
    );
    const scorePercentage =
      totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;

    // Update attempt
    attempt.endTime = new Date();
    attempt.score = scorePercentage;
    attempt.status = AttemptStatus.COMPLETED;

    const savedAttempt = await this.quizAttemptsRepository.save(attempt);
    return Array.isArray(savedAttempt) ? savedAttempt[0] : savedAttempt;
  }

  async abandonAttempt(attemptId: number): Promise<QuizAttempt> {
    const attempt = await this.findById(attemptId);

    attempt.endTime = new Date();
    attempt.status = AttemptStatus.ABANDONED;

    const savedAttempt = await this.quizAttemptsRepository.save(attempt);
    return Array.isArray(savedAttempt) ? savedAttempt[0] : savedAttempt;
  }
}
