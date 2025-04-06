import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizResponse } from '../../entities/QuizResponse';
import { QuizAttempt } from '../../entities/QuizAttempt';
import { QuizQuestion } from '../../entities/QuizQuestion';
import { QuizOption } from '../../entities/QuizOption';

@Injectable()
export class QuizResponsesService {
  constructor(
    @InjectRepository(QuizResponse)
    private quizResponsesRepository: Repository<QuizResponse>,
    @InjectRepository(QuizAttempt)
    private quizAttemptsRepository: Repository<QuizAttempt>,
    @InjectRepository(QuizQuestion)
    private quizQuestionsRepository: Repository<QuizQuestion>,
    @InjectRepository(QuizOption)
    private quizOptionsRepository: Repository<QuizOption>,
  ) {}

  async findAllByAttemptId(attemptId: number): Promise<QuizResponse[]> {
    return this.quizResponsesRepository.find({
      where: { attemptId },
      relations: ['question', 'selectedOption'],
      order: { createdAt: 'ASC' },
    });
  }

  async saveResponse(
    attemptId: number,
    questionId: number,
    selectedOptionId: number | null,
  ): Promise<QuizResponse> {
    // Check if attempt exists
    const attempt = await this.quizAttemptsRepository.findOne({
      where: { id: attemptId },
    });

    if (!attempt || attempt.status !== 'in_progress') {
      throw new NotFoundException(
        `Active quiz attempt with ID ${attemptId} not found`,
      );
    }

    // Check if question exists
    const question = await this.quizQuestionsRepository.findOne({
      where: { id: questionId },
      relations: ['options'],
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }

    // Calculate score
    let score = 0;
    if (selectedOptionId) {
      const selectedOption = await this.quizOptionsRepository.findOne({
        where: { id: selectedOptionId },
      });

      if (selectedOption && selectedOption.isCorrect) {
        score = question.points || 0;
      }
    }

    // Check if response already exists
    const existingResponse = await this.quizResponsesRepository.findOne({
      where: { attemptId, questionId },
    });

    if (existingResponse) {
      // Update existing response
      existingResponse.selectedOptionId = selectedOptionId;
      existingResponse.score = score;
      return this.quizResponsesRepository.save(existingResponse);
    } else {
      // Create new response
      const response = this.quizResponsesRepository.create({
        attemptId,
        questionId,
        selectedOptionId,
        score,
      });

      return this.quizResponsesRepository.save(response);
    }
  }

  async bulkSaveResponses(
    attemptId: number,
    responses: Array<{ questionId: number; selectedOptionId: number | null }>,
  ): Promise<QuizResponse[]> {
    const savedResponses: QuizResponse[] = [];

    for (const response of responses) {
      const savedResponse = await this.saveResponse(
        attemptId,
        response.questionId,
        response.selectedOptionId,
      );
      savedResponses.push(savedResponse);
    }

    return savedResponses;
  }
}
