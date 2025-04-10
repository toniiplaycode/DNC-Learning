import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, IsNull, In } from 'typeorm';
import { Quiz, QuizType } from '../../entities/Quiz';
import { QuizQuestion, QuestionType } from '../../entities/QuizQuestion';
import { QuizOption } from '../../entities/QuizOption';
import { QuizAttempt, AttemptStatus } from '../../entities/QuizAttempt';
import { QuizResponse } from '../../entities/QuizResponse';
import { CourseLesson } from '../../entities/CourseLesson';
import { User } from '../../entities/User';
import { UserGradesService } from '../user-grades/user-grades.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CreateAttemptDto } from './dto/create-attempt.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { GradeType } from '../../entities/UserGrade';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectRepository(Quiz)
    private quizzesRepository: Repository<Quiz>,
    @InjectRepository(QuizQuestion)
    private questionsRepository: Repository<QuizQuestion>,
    @InjectRepository(QuizOption)
    private optionsRepository: Repository<QuizOption>,
    @InjectRepository(QuizAttempt)
    private attemptsRepository: Repository<QuizAttempt>,
    @InjectRepository(QuizResponse)
    private responsesRepository: Repository<QuizResponse>,
    @InjectRepository(CourseLesson)
    private lessonsRepository: Repository<CourseLesson>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private userGradesService: UserGradesService,
  ) {}

  async create(createQuizDto: CreateQuizDto): Promise<Quiz> {
    // Kiểm tra lesson tồn tại
    const lesson = await this.lessonsRepository.findOne({
      where: { id: createQuizDto.lessonId },
      relations: ['section', 'section.course'],
    });

    if (!lesson) {
      throw new NotFoundException(
        `Không tìm thấy bài học với ID ${createQuizDto.lessonId}`,
      );
    }

    const quiz = this.quizzesRepository.create(createQuizDto);
    return this.quizzesRepository.save(quiz);
  }

  async findAll(lessonId?: number, type?: QuizType): Promise<Quiz[]> {
    const where: any = {};

    if (lessonId) {
      where.lessonId = lessonId;
    }

    if (type) {
      where.quizType = type;
    }

    return this.quizzesRepository.find({
      where,
      relations: ['lesson'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Quiz> {
    const quiz = await this.quizzesRepository.findOne({
      where: { id },
      relations: ['lesson', 'questions', 'questions.options'],
    });

    if (!quiz) {
      throw new NotFoundException(`Không tìm thấy bài kiểm tra với ID ${id}`);
    }

    // Sắp xếp câu hỏi theo thứ tự
    if (quiz.questions) {
      quiz.questions.sort((a, b) => a.orderNumber - b.orderNumber);

      // Sắp xếp các tùy chọn cho mỗi câu hỏi
      quiz.questions.forEach((question) => {
        if (question.options) {
          question.options.sort((a, b) => a.orderNumber - b.orderNumber);
        }
      });
    }

    return quiz;
  }

  async findByLesson(lessonId: number): Promise<Quiz | null> {
    if (!lessonId) {
      throw new BadRequestException('Lesson ID is required');
    }

    // Check if lesson exists
    const lesson = await this.lessonsRepository.findOne({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException(`Không tìm thấy bài học với ID ${lessonId}`);
    }

    // Find the first quiz for this lesson
    const quiz = await this.quizzesRepository.findOne({
      where: { lessonId },
      relations: ['questions', 'questions.options'],
      order: { createdAt: 'DESC' },
    });

    if (!quiz) {
      return null;
    }

    // Sort questions and options
    if (quiz.questions) {
      quiz.questions.sort((a, b) => a.orderNumber - b.orderNumber);

      quiz.questions.forEach((question) => {
        if (question.options) {
          question.options.sort((a, b) => a.orderNumber - b.orderNumber);
        }
      });
    }

    return quiz;
  }

  async findAllByStudentAcademicInAcademicClass(
    studentAcademicId: number,
  ): Promise<Quiz[]> {
    try {
      // Tìm tất cả các lớp học mà sinh viên tham gia
      const query = `
        SELECT academic_class_id 
        FROM user_students_academic 
        WHERE id = ?
      `;

      const result = await this.quizzesRepository.manager.query(query, [
        studentAcademicId,
      ]);

      if (!result || result.length === 0) {
        return [];
      }

      // Lấy academic_class_id
      const academicClassIds = result.map((row) => row.academic_class_id);

      // Tìm tất cả quiz thuộc các lớp học đó
      return this.quizzesRepository.find({
        where: { academicClassId: In(academicClassIds) },
        relations: ['questions', 'questions.options', 'academicClass'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      console.error('Error finding quizzes:', error);
      return [];
    }
  }

  async update(id: number, updateQuizDto: UpdateQuizDto): Promise<Quiz> {
    const quiz = await this.findOne(id);

    // Nếu cập nhật lessonId, kiểm tra lesson tồn tại
    if (updateQuizDto.lessonId && updateQuizDto.lessonId !== quiz.lessonId) {
      const lesson = await this.lessonsRepository.findOne({
        where: { id: updateQuizDto.lessonId },
      });

      if (!lesson) {
        throw new NotFoundException(
          `Không tìm thấy bài học với ID ${updateQuizDto.lessonId}`,
        );
      }
    }

    // Cập nhật đối tượng quiz
    const updatedQuiz = Object.assign(quiz, updateQuizDto);
    return this.quizzesRepository.save(updatedQuiz);
  }

  async remove(id: number): Promise<void> {
    const quiz = await this.findOne(id);
    await this.quizzesRepository.remove(quiz);
  }

  // Quản lý câu hỏi
  async createQuestion(
    createQuestionDto: CreateQuestionDto,
  ): Promise<QuizQuestion> {
    // Kiểm tra quiz tồn tại
    const quiz = await this.quizzesRepository.findOne({
      where: { id: createQuestionDto.quizId },
    });

    if (!quiz) {
      throw new NotFoundException(
        `Không tìm thấy bài kiểm tra với ID ${createQuestionDto.quizId}`,
      );
    }

    // Lấy số thứ tự lớn nhất hiện tại nếu không được cung cấp
    if (!createQuestionDto.orderNumber) {
      const maxOrderQuestion = await this.questionsRepository.findOne({
        where: { quizId: createQuestionDto.quizId },
        order: { orderNumber: 'DESC' },
      });

      createQuestionDto.orderNumber = maxOrderQuestion
        ? maxOrderQuestion.orderNumber + 1
        : 1;
    }

    // Tạo câu hỏi
    const question = this.questionsRepository.create({
      quizId: createQuestionDto.quizId,
      questionText: createQuestionDto.questionText,
      questionType: createQuestionDto.questionType,
      correctExplanation: createQuestionDto.correctExplanation,
      points: createQuestionDto.points || 1,
      orderNumber: createQuestionDto.orderNumber,
    });

    // Lưu câu hỏi
    const savedQuestion = await this.questionsRepository.save(question);

    // Nếu có options, tạo và lưu các options
    if (createQuestionDto.options && createQuestionDto.options.length > 0) {
      const options = createQuestionDto.options.map((option, index) => {
        return this.optionsRepository.create({
          questionId: savedQuestion.id,
          optionText: option.optionText,
          isCorrect: option.isCorrect,
          orderNumber: option.orderNumber || index + 1,
        });
      });

      await this.optionsRepository.save(options);
    }

    // Trả về câu hỏi đã lưu với options
    return this.findQuestion(savedQuestion.id);
  }

  async findQuestion(id: number): Promise<QuizQuestion> {
    const question = await this.questionsRepository.findOne({
      where: { id },
      relations: ['options'],
    });

    if (!question) {
      throw new NotFoundException(`Không tìm thấy câu hỏi với ID ${id}`);
    }

    // Sắp xếp options theo thứ tự
    if (question.options) {
      question.options.sort((a, b) => a.orderNumber - b.orderNumber);
    }

    return question;
  }

  async removeQuestion(id: number): Promise<void> {
    const question = await this.findQuestion(id);
    await this.questionsRepository.remove(question);
  }

  // Quản lý lần thử bài kiểm tra
  async createAttempt(
    createAttemptDto: CreateAttemptDto,
    userId: number,
  ): Promise<QuizAttempt> {
    // Kiểm tra quiz tồn tại
    const quiz = await this.quizzesRepository.findOne({
      where: { id: createAttemptDto.quizId },
    });

    if (!quiz) {
      throw new NotFoundException(
        `Không tìm thấy bài kiểm tra với ID ${createAttemptDto.quizId}`,
      );
    }

    // Tạo lần thử mới
    const attempt = this.attemptsRepository.create({
      quizId: createAttemptDto.quizId,
      userId,
      startTime: new Date(),
      status: AttemptStatus.IN_PROGRESS,
    });

    return this.attemptsRepository.save(attempt);
  }

  async findAttemptByUserIdAndQuizId(
    userId: number,
    quizId: number,
  ): Promise<QuizAttempt | null> {
    const attempt = await this.attemptsRepository.findOne({
      where: { userId, quizId },
    });

    if (!attempt) {
      throw new NotFoundException(`Không tìm thấy lần thử với ID ${quizId}`);
    }

    return attempt;
  }

  async findUserAttempts(userId: number): Promise<QuizAttempt[]> {
    return this.attemptsRepository.find({
      where: { userId },
      relations: ['quiz'],
      order: { startTime: 'DESC' },
    });
  }

  async findAttempt(id: number, userId: number): Promise<QuizAttempt> {
    const attempt = await this.attemptsRepository.findOne({
      where: { id },
      relations: [
        'quiz',
        'quiz.questions',
        'quiz.questions.options',
        'responses',
      ],
    });

    if (!attempt) {
      throw new NotFoundException(`Không tìm thấy lần thử với ID ${id}`);
    }

    // Kiểm tra quyền truy cập
    if (attempt.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền truy cập lần thử này');
    }

    // Sắp xếp câu hỏi theo thứ tự
    if (attempt.quiz.questions) {
      attempt.quiz.questions.sort((a, b) => a.orderNumber - b.orderNumber);

      // Sắp xếp các tùy chọn cho mỗi câu hỏi
      attempt.quiz.questions.forEach((question) => {
        if (question.options) {
          question.options.sort((a, b) => a.orderNumber - b.orderNumber);
        }
      });
    }

    return attempt;
  }

  async submitQuizResponsesAndUpdateAttempt(
    submitQuizDto: SubmitQuizDto,
    userId: number,
  ): Promise<any> {
    // Kiểm tra lần thử tồn tại và thuộc về người dùng
    const attempt = await this.attemptsRepository.findOne({
      where: { id: submitQuizDto.attemptId },
      relations: ['quiz', 'quiz.questions', 'quiz.questions.options'],
    });

    if (!attempt) {
      throw new NotFoundException(
        `Không tìm thấy lần thử với ID ${submitQuizDto.attemptId}`,
      );
    }

    if (attempt.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền nộp bài kiểm tra này');
    }

    if (attempt.status === AttemptStatus.COMPLETED) {
      throw new BadRequestException('Bài kiểm tra này đã được nộp trước đó');
    }

    // Lưu các câu trả lời
    const responses: QuizResponse[] = [];

    // Xử lý dữ liệu từ định dạng mới
    const {
      questionIds,
      responses: selectedOptionIds,
      attemptId,
    } = submitQuizDto;

    // Kiểm tra độ dài mảng
    if (questionIds.length !== selectedOptionIds.length) {
      throw new BadRequestException(
        'Số lượng câu hỏi và câu trả lời không khớp',
      );
    }

    // Tạo các response entries
    for (let i = 0; i < questionIds.length; i++) {
      const questionId = questionIds[i];
      const selectedOptionId = selectedOptionIds[i];

      const question = attempt.quiz.questions.find(
        (q) => Number(q.id) === Number(questionId),
      );

      if (!question) {
        throw new BadRequestException(
          `Câu hỏi với ID ${questionId} không tồn tại trong bài kiểm tra này`,
        );
      }

      // Tạo response (không cần tính score vì đã có trigger)
      const response = this.responsesRepository.create({
        attemptId: attempt.id,
        questionId: questionId,
        selectedOptionId: selectedOptionId || null,
      });

      responses.push(response);
    }

    // Lưu tất cả responses
    await this.responsesRepository.save(responses);

    // Cập nhật attempt
    attempt.endTime = new Date();
    attempt.status = AttemptStatus.COMPLETED;

    // Lưu attempt
    const updatedAttempt = await this.attemptsRepository.save(attempt);

    // // Tạo điểm cho user nếu là bài kiểm tra chính thức
    // if (attempt.quiz.quizType !== QuizType.PRACTICE) {
    //   let lesson;
    //   if (attempt.quiz.lessonId) {
    //     lesson = await this.lessonsRepository.findOne({
    //       where: { id: attempt.quiz.lessonId },
    //       relations: ['section', 'section.course'],
    //     });
    //   }

    //   if (lesson && lesson.section && lesson.section.course) {
    //     // Tìm instructor cho quiz này
    //     let gradedBy = 1; // Default admin ID

    //     // Tính tổng điểm và điểm tối đa (lấy từ responses sau khi đã tính bởi trigger)
    //     const quizResponses = await this.responsesRepository.find({
    //       where: { attemptId: attempt.id },
    //     });

    //     const totalScore = quizResponses.reduce(
    //       (sum, response) => sum + (response.score || 0),
    //       0,
    //     );

    //     const totalPoints = attempt.quiz.questions.length;

    //     // Tạo user grade
    //     await this.userGradesService.create({
    //       userId,
    //       courseId: lesson.section.course.id,
    //       gradedBy,
    //       quizId: attempt.quiz.id,
    //       gradeType: this.mapQuizTypeToGradeType(attempt.quiz.quizType),
    //       score: totalScore,
    //       maxScore: totalPoints,
    //       weight: 10, // Cần điều chỉnh theo từng loại quiz
    //       feedback: `Điểm tự động từ bài kiểm tra: ${attempt.quiz.title}`,
    //     });
    //   }
    // }

    // return this.getResults(updatedAttempt.id, userId);
  }

  async getResults(attemptId: number, userId: number): Promise<any> {
    const attempt = await this.attemptsRepository.findOne({
      where: { id: attemptId },
      relations: [
        'quiz',
        'responses',
        'responses.question',
        'responses.selectedOption',
        'responses.question.options',
      ],
    });

    if (!attempt) {
      throw new NotFoundException(`Không tìm thấy lần thử với ID ${attemptId}`);
    }

    if (attempt.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xem kết quả này');
    }

    // Lấy tất cả câu hỏi trong quiz
    const questions = await this.questionsRepository.find({
      where: { quizId: attempt.quiz.id },
      relations: ['options'],
    });

    // Tính toán và trả về kết quả
    const results = {
      attemptId: attempt.id,
      quizId: attempt.quiz.id,
      quizTitle: attempt.quiz.title,
      startTime: attempt.startTime,
      endTime: attempt.endTime,
      score: attempt.score,
      status: attempt.status,
      timeSpent: attempt.endTime
        ? Math.round(
            (attempt.endTime.getTime() - attempt.startTime.getTime()) / 1000,
          )
        : 0,
      passingScore: attempt.quiz.passingScore,
      passed: attempt.quiz.passingScore
        ? (attempt.score ?? 0) >= attempt.quiz.passingScore
        : true,
      questions: questions.map((question) => {
        const response = attempt.responses.find(
          (r) => r.questionId === question.id,
        );
        const correctOption = question.options.find((o) => o.isCorrect);

        return {
          id: question.id,
          questionText: question.questionText,
          points: question.points,
          selectedOption: response?.selectedOption
            ? {
                id: response.selectedOption.id,
                text: response.selectedOption.optionText,
                isCorrect: response.selectedOption.isCorrect,
              }
            : null,
          correctOption: correctOption
            ? {
                id: correctOption.id,
                text: correctOption.optionText,
              }
            : null,
          score: response?.score || 0,
          explanation: question.correctExplanation,
        };
      }),
    };

    return results;
  }

  // Helper methods
  private mapQuizTypeToGradeType(quizType: QuizType): GradeType {
    switch (quizType) {
      case QuizType.PRACTICE:
      case QuizType.HOMEWORK:
        return GradeType.QUIZ;
      case QuizType.MIDTERM:
        return GradeType.MIDTERM;
      case QuizType.FINAL:
        return GradeType.FINAL;
      default:
        return GradeType.QUIZ;
    }
  }
}
