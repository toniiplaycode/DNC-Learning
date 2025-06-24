import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, IsNull, In, Brackets } from 'typeorm';
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
import { Course } from 'src/entities/Course';
import { UserGrade } from '../../entities/UserGrade';

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
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
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
    const quiz = await this.quizzesRepository
      .createQueryBuilder('quiz')
      .leftJoinAndSelect('quiz.questions', 'questions')
      .leftJoinAndSelect('questions.options', 'options')
      // For lesson-based quizzes
      .leftJoinAndSelect('quiz.lesson', 'lesson')
      .leftJoinAndSelect('lesson.section', 'section')
      .leftJoinAndSelect('section.course', 'course')
      .leftJoinAndSelect('course.instructor', 'courseInstructor')
      .leftJoinAndSelect('courseInstructor.user', 'courseInstructorUser')
      // For academic class quizzes
      .leftJoinAndSelect('quiz.academicClass', 'academicClass')
      .leftJoinAndSelect('academicClass.instructors', 'academicClassInstructor')
      .leftJoinAndSelect(
        'academicClassInstructor.instructor',
        'classInstructor',
      )
      .leftJoinAndSelect('classInstructor.user', 'classInstructorUser')
      .where('quiz.id = :id', { id })
      .getOne();

    if (!quiz) {
      throw new NotFoundException(`Không tìm thấy bài kiểm tra với ID ${id}`);
    }

    // Sort questions by order number
    if (quiz.questions) {
      quiz.questions.sort((a, b) => a.orderNumber - b.orderNumber);

      // Sort options for each question
      quiz.questions.forEach((question) => {
        if (question.options) {
          question.options.sort((a, b) => a.orderNumber - b.orderNumber);
        }
      });
    }

    // For easier access in the frontend, add instructorUserId to the quiz object
    if (quiz.lesson) {
      // For lesson-based quizzes
      quiz['instructorUserId'] =
        quiz.lesson.section?.course?.instructor?.user?.id;
    } else if (quiz.academicClass?.instructors?.[0]) {
      // For academic class quizzes
      quiz['instructorUserId'] =
        quiz.academicClass.instructors[0].instructor?.user?.id;
    }

    return quiz;
  }

  async findByLesson(lessonId: number): Promise<Quiz | null> {
    if (!lessonId) {
      throw new BadRequestException('Lesson ID is required');
    }

    // Use QueryBuilder to get lesson with all necessary relations
    const quiz = await this.quizzesRepository
      .createQueryBuilder('quiz')
      .leftJoinAndSelect('quiz.questions', 'questions')
      .leftJoinAndSelect('questions.options', 'options')
      .leftJoinAndSelect('quiz.lesson', 'lesson')
      .leftJoinAndSelect('lesson.section', 'section')
      .leftJoinAndSelect('section.course', 'course')
      .leftJoinAndSelect('course.instructor', 'instructor')
      .leftJoinAndSelect('instructor.user', 'instructorUser')
      .where('quiz.lessonId = :lessonId', { lessonId })
      .orderBy('quiz.createdAt', 'DESC')
      .getOne();

    if (!quiz) {
      return null;
    }

    // Sort questions by order number
    if (quiz.questions) {
      quiz.questions.sort((a, b) => a.orderNumber - b.orderNumber);

      // Sort options for each question
      quiz.questions.forEach((question) => {
        if (question.options) {
          question.options.sort((a, b) => a.orderNumber - b.orderNumber);
        }
      });
    }

    // Add instructorUserId for easier access in frontend
    if (quiz.lesson?.section?.course?.instructor?.user) {
      quiz['instructorUserId'] = quiz.lesson.section.course.instructor.user.id;
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

  async findQuizzesByCourseId(id: number): Promise<Quiz[]> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: [
        'sections',
        'sections.lessons',
        'sections.lessons.quizzes', // Load relation đến quizzes
        'sections.lessons.quizzes.questions',
        'sections.lessons.quizzes.questions.options',
        'sections.lessons.quizzes.attempts',
      ],
    });

    if (!course) {
      throw new Error('Course not found');
    }

    // Thu thập tất cả quiz từ tất cả lessons trong tất cả sections
    const quizzes: Quiz[] = [];
    for (const section of course.sections) {
      for (const lesson of section.lessons) {
        if (lesson.quizzes && lesson.quizzes.length > 0) {
          quizzes.push(...lesson.quizzes);
        }
      }
    }

    return quizzes;
  }

  async findAllQuizzesByInstructor(instructorId: number): Promise<Quiz[]> {
    try {
      // Using query builder to handle complex joins
      const quizzes = await this.quizzesRepository
        .createQueryBuilder('quiz')
        // Join for lesson-based quizzes
        .leftJoinAndSelect('quiz.lesson', 'lesson')
        .leftJoinAndSelect('lesson.section', 'section')
        .leftJoinAndSelect('section.course', 'course')
        // Join for academic class quizzes
        .leftJoinAndSelect('quiz.academicClass', 'academicClass')
        .leftJoinAndSelect(
          'academicClass.instructors',
          'academicClassInstructor',
        )
        // Load related entities
        .leftJoinAndSelect('quiz.questions', 'questions')
        .leftJoinAndSelect('questions.options', 'options')
        // Where conditions for both types of quizzes
        .where(
          new Brackets((qb) => {
            qb.where('course.instructorId = :instructorId', {
              instructorId,
            }).orWhere('academicClassInstructor.instructorId = :instructorId', {
              instructorId,
            });
          }),
        )
        // Order by creation date
        .orderBy('quiz.createdAt', 'DESC')
        .getMany();

      // Sort questions and options
      quizzes.forEach((quiz) => {
        if (quiz.questions) {
          quiz.questions.sort((a, b) => a.orderNumber - b.orderNumber);
          quiz.questions.forEach((question) => {
            if (question.options) {
              question.options.sort((a, b) => a.orderNumber - b.orderNumber);
            }
          });
        }
      });

      return quizzes;
    } catch (error) {
      console.error('Error finding quizzes:', error);
      throw new BadRequestException('Không thể lấy danh sách bài trắc nghiệm');
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

  async remove(
    id: number,
  ): Promise<{ success: boolean; message: string; error?: string }> {
    const queryRunner =
      this.quizzesRepository.manager.connection.createQueryRunner();

    try {
      // Start transaction
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Check if quiz exists with relations
      const quiz = await queryRunner.manager.findOne(Quiz, {
        where: { id },
        relations: ['questions', 'questions.options'],
      });

      if (!quiz) {
        throw new NotFoundException(`Không tìm thấy bài kiểm tra với ID ${id}`);
      }

      // Check for attempts
      const hasAttempts = await queryRunner.manager.findOne(QuizAttempt, {
        where: { quizId: id },
      });

      if (hasAttempts) {
        return {
          success: false,
          message: 'Không thể xóa bài kiểm tra vì đã có học viên làm bài',
          error: 'Rejected',
        };
      }

      try {
        // Delete in correct order to maintain referential integrity
        if (quiz.questions) {
          // Delete options first
          for (const question of quiz.questions) {
            if (question.options) {
              await queryRunner.manager.delete(QuizOption, {
                questionId: question.id,
              });
            }
          }

          // Then delete questions
          await queryRunner.manager.delete(QuizQuestion, {
            quizId: id,
          });
        }

        // Finally delete quiz
        await queryRunner.manager.remove(quiz);

        // Commit if all operations succeeded
        await queryRunner.commitTransaction();

        return {
          success: true,
          message: 'Xóa bài kiểm tra thành công',
        };
      } catch (err) {
        // Rollback on any error during deletion
        await queryRunner.rollbackTransaction();

        return {
          success: false,
          message: 'Không thể xóa bài kiểm tra vì còn dữ liệu liên quan',
          error: 'Rejected',
        };
      }
    } catch (error) {
      // Handle any other errors
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      return {
        success: false,
        message: 'Lỗi khi xóa bài kiểm tra',
        error: 'Rejected',
      };
    } finally {
      // Always release query runner
      await queryRunner.release();
    }
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
      order: { id: 'DESC' }, // lấy lần thử mới nhất
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

  async findAllAttemptsByQuizId(quizId: number): Promise<QuizAttempt[]> {
    try {
      const attempts = await this.attemptsRepository
        .createQueryBuilder('attempt')
        // Basic attempt info
        .select([
          'attempt.id',
          'attempt.userId',
          'attempt.quizId',
          'attempt.startTime',
          'attempt.endTime',
          'attempt.score',
          'attempt.status',
          'attempt.createdAt',
          'attempt.updatedAt',
        ])

        // Quiz basic info without questions
        .leftJoinAndSelect('attempt.quiz', 'quiz')
        .leftJoinAndSelect('quiz.lesson', 'lesson')
        .leftJoinAndSelect('lesson.section', 'section')
        .leftJoinAndSelect('section.course', 'course')
        .leftJoinAndSelect('quiz.academicClass', 'academicClass')

        // Student info
        .leftJoinAndSelect('attempt.user', 'user')
        .leftJoinAndSelect('user.userStudent', 'userStudent')
        .leftJoinAndSelect('user.userStudentAcademic', 'userStudentAcademic')

        // Responses and questions data with all options
        .leftJoinAndSelect('attempt.responses', 'responses')
        .leftJoinAndSelect('responses.question', 'question')
        .leftJoinAndSelect('question.options', 'allOptions')
        .leftJoinAndSelect('responses.selectedOption', 'selectedOption')

        // Filter by quiz ID
        .where('attempt.quizId = :quizId', { quizId })

        // Only completed attempts
        .andWhere('attempt.status = :status', {
          status: AttemptStatus.COMPLETED,
        })

        // Sort by newest first
        .orderBy('attempt.endTime', 'DESC')
        .getMany();

      // Sort responses and options
      attempts.forEach((attempt) => {
        if (attempt.responses) {
          // Sort responses by question order
          attempt.responses.sort((a, b) => {
            return (
              (a.question?.orderNumber ?? 0) - (b.question?.orderNumber ?? 0)
            );
          });

          // Sort options for each question
          attempt.responses.forEach((response) => {
            if (response.question?.options) {
              response.question.options.sort(
                (a, b) => a.orderNumber - b.orderNumber,
              );
            }
          });
        }
      });

      return attempts;
    } catch (error) {
      console.error('Error getting attempts:', error);
      throw new BadRequestException('Không thể lấy danh sách bài làm');
    }
  }

  async findAllAttemptsByInstructor(
    instructorId: number,
  ): Promise<QuizAttempt[]> {
    try {
      const attempts = await this.attemptsRepository
        .createQueryBuilder('attempt')
        // Basic attempt info
        .select([
          'attempt.id',
          'attempt.userId',
          'attempt.quizId',
          'attempt.startTime',
          'attempt.endTime',
          'attempt.score',
          'attempt.status',
          'attempt.createdAt',
          'attempt.updatedAt',
        ])

        // Quiz basic info without questions
        .leftJoinAndSelect('attempt.quiz', 'quiz')
        .leftJoinAndSelect('quiz.lesson', 'lesson')
        .leftJoinAndSelect('lesson.section', 'section')
        .leftJoinAndSelect('section.course', 'course')
        .leftJoinAndSelect('quiz.academicClass', 'academicClass')
        .leftJoinAndSelect(
          'academicClass.instructors',
          'academicClassInstructor',
        )

        // Student info
        .leftJoinAndSelect('attempt.user', 'user')
        .leftJoinAndSelect('user.userStudent', 'userStudent')
        .leftJoinAndSelect('user.userStudentAcademic', 'userStudentAcademic')

        // Responses and questions data with all options
        .leftJoinAndSelect('attempt.responses', 'responses')
        .leftJoinAndSelect('responses.question', 'question')
        .leftJoinAndSelect('question.options', 'allOptions') // Add all options for questions
        .leftJoinAndSelect('responses.selectedOption', 'selectedOption')

        // Filter by instructor
        .where(
          new Brackets((qb) => {
            qb.where('course.instructorId = :instructorId', {
              instructorId,
            }).orWhere('academicClassInstructor.instructorId = :instructorId', {
              instructorId,
            });
          }),
        )

        // Only completed attempts
        .andWhere('attempt.status = :status', {
          status: AttemptStatus.COMPLETED,
        })

        // Sort by newest first
        .orderBy('attempt.endTime', 'DESC')
        .getMany();

      // Sort responses and options
      attempts.forEach((attempt) => {
        if (attempt.responses) {
          // Sort responses by question order
          attempt.responses.sort((a, b) => {
            return (
              (a.question?.orderNumber ?? 0) - (b.question?.orderNumber ?? 0)
            );
          });

          // Sort options for each question
          attempt.responses.forEach((response) => {
            if (response.question?.options) {
              response.question.options.sort(
                (a, b) => a.orderNumber - b.orderNumber,
              );
            }
          });
        }
      });

      return attempts;
    } catch (error) {
      console.error('Error getting attempts:', error);
      throw new BadRequestException('Không thể lấy danh sách bài làm');
    }
  }

  async submitQuizResponsesAndUpdateAttempt(
    submitQuizDto: SubmitQuizDto,
    userId: number,
  ): Promise<any> {
    const queryRunner =
      this.attemptsRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get attempt with all necessary relations
      const attempt = await queryRunner.manager.findOne(QuizAttempt, {
        where: { id: submitQuizDto.attemptId },
        relations: [
          'quiz',
          'quiz.questions',
          'quiz.questions.options',
          'quiz.lesson',
          'quiz.lesson.section',
          'quiz.lesson.section.course',
          'quiz.academicClass',
          'quiz.academicClass.instructors',
        ],
      });

      if (!attempt) {
        throw new NotFoundException(
          `Không tìm thấy lần thử với ID ${submitQuizDto.attemptId}`,
        );
      }

      if (attempt.userId !== userId) {
        throw new ForbiddenException('Bạn không có quyền nộp bài kiểm tra này');
      }

      // Create and save responses
      const responses: QuizResponse[] = [];
      const { questionIds, responses: selectedOptionIds } = submitQuizDto;

      if (questionIds.length !== selectedOptionIds.length) {
        throw new BadRequestException(
          'Số lượng câu hỏi và câu trả lời không khớp',
        );
      }

      // Create responses
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

        const response = queryRunner.manager.create(QuizResponse, {
          attemptId: attempt.id,
          questionId: questionId,
          selectedOptionId: selectedOptionId || null,
        });

        responses.push(response);
      }

      await queryRunner.manager.save(QuizResponse, responses);

      // Calculate score
      const quizResponses = await queryRunner.manager.find(QuizResponse, {
        where: { attemptId: attempt.id },
      });

      const totalPoints = quizResponses.reduce(
        (sum, response) => sum + (Number(response.score) || 0),
        0,
      );

      const totalQuestions = quizResponses.length;
      const scorePercentage =
        totalQuestions > 0
          ? Math.round((totalPoints / totalQuestions) * 100)
          : 0;

      // Update attempt
      attempt.endTime = new Date();
      attempt.score = scorePercentage;
      attempt.status = AttemptStatus.COMPLETED;
      await queryRunner.manager.save(QuizAttempt, attempt);

      // Determine instructor ID
      let instructorId: number | null = null;

      if (attempt.quiz.lessonId) {
        // Get instructor from course
        instructorId =
          attempt.quiz.lesson?.section?.course?.instructorId || null;
      } else if (attempt.quiz.academicClassId) {
        // Get first instructor from academic class
        instructorId =
          attempt.quiz.academicClass?.instructors[0]?.instructorId || null;
      }

      if (!instructorId) {
        throw new BadRequestException(
          'Không tìm thấy giảng viên cho bài kiểm tra này',
        );
      }

      // Check for existing attempts for this quiz by this user
      const existingAttempts = await queryRunner.manager.find(QuizAttempt, {
        where: {
          userId,
          quizId: attempt.quizId,
          status: AttemptStatus.COMPLETED,
        },
      });

      console.log('Existing attempts:', existingAttempts);

      // Check for existing grade based on first attempt
      const existingGrade = await queryRunner.manager.findOne(UserGrade, {
        where: {
          userId,
          gradeType: GradeType.QUIZ,
          quizAttemptId: existingAttempts[0]?.id, // Get first attempt's grade
        },
      });

      console.log('Existing grade:', existingGrade);

      if (existingAttempts.length > 1) {
        // Not first attempt - update existing grade with new score
        if (existingGrade) {
          existingGrade.score = scorePercentage;
          existingGrade.gradedAt = new Date();
          existingGrade.quizAttemptId = attempt.id; // Update to latest attempt
          await queryRunner.manager.save(UserGrade, existingGrade);
        }
      } else {
        // First attempt - create new grade
        const newGrade = new UserGrade();

        // Required fields
        newGrade.userId = userId;
        newGrade.gradedBy = instructorId;
        newGrade.gradeType = GradeType.QUIZ;
        newGrade.score = scorePercentage;
        newGrade.maxScore = 100;

        // Set weight based on quiz type
        if (attempt.quiz.weight == null) {
          throw new BadRequestException(
            'Quiz chưa có trọng số (weight). Vui lòng cập nhật trọng số cho quiz!',
          );
        }
        newGrade.weight = attempt.quiz.weight;
        newGrade.gradedAt = new Date();

        // Optional fields with proper null handling
        newGrade.quizAttemptId = attempt.id;
        newGrade.courseId = attempt.quiz.lesson?.section?.course?.id ?? null;
        newGrade.lessonId = attempt.quiz.lessonId ?? null;
        newGrade.assignmentSubmissionId = null;
        newGrade.feedback = null;

        await queryRunner.manager.save(UserGrade, newGrade);
      }

      await queryRunner.commitTransaction();
      return attempt;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(
        'Lỗi khi nộp bài kiểm tra: ' + error.message,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async createQuizWithQuestionsAndOptions(createQuizDto: any): Promise<Quiz> {
    const queryRunner =
      this.quizzesRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Create the quiz first
      const quiz = this.quizzesRepository.create({
        title: createQuizDto.title,
        description: createQuizDto.description,
        lessonId: createQuizDto.lessonId,
        academicClassId: createQuizDto.academicClassId,
        timeLimit: createQuizDto.timeLimit,
        passingScore: createQuizDto.passingScore,
        attemptsAllowed: createQuizDto.attemptsAllowed,
        quizType: createQuizDto.quizType,
        showExplanation: createQuizDto.showExplanation,
        random: createQuizDto.random,
        startTime: createQuizDto.startTime,
        endTime: createQuizDto.endTime,
        weight: createQuizDto.weight,
      });

      const savedQuiz = await queryRunner.manager.save(Quiz, quiz);

      // 2. Create questions with their options
      const questions = createQuizDto.questions.map((questionDto) => ({
        questionText: questionDto.questionText,
        questionType: questionDto.questionType,
        points: questionDto.points,
        orderNumber: questionDto.orderNumber,
        correctExplanation: questionDto.correctExplanation,
        quizId: savedQuiz.id,
      }));

      const savedQuestions = await queryRunner.manager.save(
        QuizQuestion,
        questions,
      );

      // 3. Create options for each question
      const options: QuizOption[] = [];
      savedQuestions.forEach((question, index) => {
        const questionOptions = createQuizDto.questions[index].options.map(
          (optionDto) => ({
            optionText: optionDto.optionText,
            isCorrect: optionDto.isCorrect,
            orderNumber: optionDto.orderNumber,
            questionId: question.id,
          }),
        );
        options.push(...questionOptions);
      });

      await queryRunner.manager.save(QuizOption, options);

      // Commit transaction
      await queryRunner.commitTransaction();

      // Return the complete quiz with questions and options
      return this.findOne(savedQuiz.id);
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(
        'Lỗi khi tạo bài kiểm tra: ' + error.message,
      );
    } finally {
      // Release queryRunner
      await queryRunner.release();
    }
  }

  async updateQuizWithQuestionsAndOptions(
    quizId: number,
    updateQuizDto: any,
  ): Promise<Quiz> {
    const queryRunner =
      this.quizzesRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Update the quiz
      const quiz = await queryRunner.manager.findOne(Quiz, {
        where: { id: quizId },
      });

      if (!quiz) {
        throw new NotFoundException(`Quiz with ID ${quizId} not found`);
      }

      // Update quiz properties
      Object.assign(quiz, {
        title: updateQuizDto.title,
        description: updateQuizDto.description,
        lessonId: updateQuizDto.lessonId,
        academicClassId: updateQuizDto.academicClassId,
        timeLimit: updateQuizDto.timeLimit,
        passingScore: updateQuizDto.passingScore,
        attemptsAllowed: updateQuizDto.attemptsAllowed,
        quizType: updateQuizDto.quizType,
        showExplanation: updateQuizDto.showExplanation,
        random: updateQuizDto.random,
        startTime: updateQuizDto.startTime,
        endTime: updateQuizDto.endTime,
        weight: updateQuizDto.weight,
      });

      await queryRunner.manager.save(Quiz, quiz);

      // 2. Delete existing questions and options
      await queryRunner.manager.delete(QuizOption, {
        questionId: In(
          await queryRunner.manager
            .find(QuizQuestion, {
              where: { quizId },
              select: ['id'],
            })
            .then((questions) => questions.map((q) => q.id)),
        ),
      });
      await queryRunner.manager.delete(QuizQuestion, { quizId });

      // 3. Create new questions
      const questions = updateQuizDto.questions.map((questionDto) => ({
        questionText: questionDto.questionText,
        questionType: questionDto.questionType,
        points: questionDto.points,
        orderNumber: questionDto.orderNumber,
        correctExplanation: questionDto.correctExplanation,
        quizId: quiz.id,
      }));

      const savedQuestions = await queryRunner.manager.save(
        QuizQuestion,
        questions,
      );

      // 4. Create new options for each question
      const options: QuizOption[] = [];
      savedQuestions.forEach((question, index) => {
        const questionOptions = updateQuizDto.questions[index].options.map(
          (optionDto) => ({
            optionText: optionDto.optionText,
            isCorrect: optionDto.isCorrect,
            orderNumber: optionDto.orderNumber,
            questionId: question.id,
          }),
        );
        options.push(...questionOptions);
      });

      await queryRunner.manager.save(QuizOption, options);

      // Commit transaction
      await queryRunner.commitTransaction();

      // Return updated quiz with questions and options
      return this.findOne(quiz.id);
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(
        'Lỗi khi cập nhật bài kiểm tra: ' + error.message,
      );
    } finally {
      // Release queryRunner
      await queryRunner.release();
    }
  }

  async updateShowExplanation(
    quizId: number,
    { showExplanation }: any,
  ): Promise<Quiz> {
    const queryRunner =
      this.quizzesRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Tìm quiz cần cập nhật
      const quiz = await queryRunner.manager.findOne(Quiz, {
        where: { id: quizId },
      });

      if (!quiz) {
        throw new NotFoundException(
          `Không tìm thấy bài kiểm tra với ID ${quizId}`,
        );
      }

      // Cập nhật showExplanation
      quiz.showExplanation = showExplanation;
      const updatedQuiz = await queryRunner.manager.save(Quiz, quiz);

      // Commit transaction
      await queryRunner.commitTransaction();

      return updatedQuiz;
    } catch (error) {
      // Rollback transaction nếu có lỗi
      await queryRunner.rollbackTransaction();

      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        'Lỗi khi cập nhật trạng thái hiển thị giải thích: ' + error.message,
      );
    } finally {
      // Giải phóng queryRunner
      await queryRunner.release();
    }
  }
}
