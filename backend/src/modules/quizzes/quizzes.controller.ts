import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { QuizAttemptsService } from './quiz-attempts.service';
import { QuizResponsesService } from './quiz-responses.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CreateAttemptDto } from './dto/create-attempt.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/User';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { QuizType } from '../../entities/Quiz';
import { Quiz } from '../../entities/Quiz';
import { QuizAttempt } from 'src/entities/QuizAttempt';

@Controller('quizzes')
export class QuizzesController {
  constructor(
    private readonly quizzesService: QuizzesService,
    private readonly quizzesAttemptsService: QuizAttemptsService,
    private readonly quizzesResponsesService: QuizResponsesService,
  ) {}

  @Post()
  async createQuizWithQuestionsAndOptions(@Body() createQuizDto: any) {
    const quiz =
      await this.quizzesService.createQuizWithQuestionsAndOptions(
        createQuizDto,
      );
    return {
      status: 'success',
      data: quiz,
      message: 'Tạo bài kiểm tra thành công',
    };
  }

  @Patch(':id')
  async updateQuizWithQuestionsAndOptions(
    @Param('id', ParseIntPipe) quizId: number,
    @Body() updateQuizDto: any,
  ) {
    const quiz = await this.quizzesService.updateQuizWithQuestionsAndOptions(
      quizId,
      updateQuizDto,
    );
    return {
      status: 'success',
      data: quiz,
      message: 'Sửa bài kiểm tra thành công',
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @Query('lessonId') lessonId?: string,
    @Query('type') type?: QuizType,
  ) {
    return this.quizzesService.findAll(
      lessonId ? parseInt(lessonId, 10) : undefined,
      type,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.quizzesService.findOne(id);
  }

  @Get('lesson/:lessonId')
  @UseGuards(JwtAuthGuard)
  findByLesson(@Param('lessonId', ParseIntPipe) lessonId: number) {
    return this.quizzesService.findByLesson(lessonId);
  }

  @Get('student-academic/:id')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.STUDENT_ACADEMIC)
  async findAllByStudentAcademicInAcademicClass(
    @Param('id', ParseIntPipe) studentAcademicId: number,
  ): Promise<Quiz[]> {
    return this.quizzesService.findAllByStudentAcademicInAcademicClass(
      studentAcademicId,
    );
  }

  @Get('courses/:id')
  async getCourseQuizzes(@Param('id') id: string) {
    return this.quizzesService.findQuizzesByCourseId(Number(id));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQuizDto: UpdateQuizDto,
  ) {
    return this.quizzesService.update(id, updateQuizDto);
  }

  @Get('instructor/:instructorId')
  async findAllByInstructor(@Param('instructorId') instructorId: number) {
    return this.quizzesService.findAllQuizzesByInstructor(instructorId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.quizzesService.remove(id);
  }

  // Quản lý câu hỏi
  @Post('questions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  createQuestion(@Body() createQuestionDto: CreateQuestionDto) {
    return this.quizzesService.createQuestion(createQuestionDto);
  }

  @Get('questions/:id')
  @UseGuards(JwtAuthGuard)
  findQuestion(@Param('id', ParseIntPipe) id: number) {
    return this.quizzesService.findQuestion(id);
  }

  @Delete('questions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  removeQuestion(@Param('id', ParseIntPipe) id: number) {
    return this.quizzesService.removeQuestion(id);
  }

  // Quản lý lần thử bài kiểm tra
  @Post('attempts')
  @UseGuards(JwtAuthGuard)
  createAttempt(@Body() createAttemptDto: CreateAttemptDto, @GetUser() user) {
    return this.quizzesService.createAttempt(createAttemptDto, user.id);
  }

  @Get('attempts/user/:userId/quiz/:quizId')
  @UseGuards(JwtAuthGuard)
  findAttemptByUserIdAndQuizId(
    @Param('userId') userId: number,
    @Param('quizId') quizId: number,
  ) {
    return this.quizzesService.findAttemptByUserIdAndQuizId(userId, quizId);
  }

  @Get('attempts/user')
  @UseGuards(JwtAuthGuard)
  findUserAttempts(@GetUser() user) {
    return this.quizzesService.findUserAttempts(user.id);
  }

  @Get('attempts/:id')
  @UseGuards(JwtAuthGuard)
  findAttempt(@Param('id', ParseIntPipe) id: number, @GetUser() user) {
    return this.quizzesService.findAttempt(id, user.id);
  }

  @Get('attempts/instructor/:instructorId')
  async findAllAttemptsByInstructor(
    @Param('instructorId') instructorId: number,
  ) {
    return this.quizzesService.findAllAttemptsByInstructor(instructorId);
  }

  @Get('attempts/quiz/:quizId')
  async findAttemptsByQuizId(
    @Param('quizId', ParseIntPipe) quizId: number,
  ): Promise<QuizAttempt[]> {
    try {
      const attempts =
        await this.quizzesService.findAllAttemptsByQuizId(quizId);
      return attempts;
    } catch (error) {
      throw new BadRequestException('Không thể lấy danh sách bài làm');
    }
  }

  @Post('submit')
  @UseGuards(JwtAuthGuard)
  submitQuizResponsesAndUpdateAttempt(
    @Body() submitQuizDto: SubmitQuizDto,
    @GetUser() user,
  ) {
    return this.quizzesService.submitQuizResponsesAndUpdateAttempt(
      submitQuizDto,
      user.id,
    );
  }

  // Quản lý Attempts
  @Get('attempts/:id')
  findAttemptById(@Param('id') id: number) {
    return this.quizzesAttemptsService.findById(id);
  }

  @Get('attempts/user/:userId')
  findAttemptsByUser(@Param('userId') userId: number) {
    return this.quizzesAttemptsService.findAllByUserId(userId);
  }
}
