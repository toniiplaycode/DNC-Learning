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

@Controller('quizzes')
export class QuizzesController {
  constructor(
    private readonly quizzesService: QuizzesService,
    private readonly quizzesAttemptsService: QuizAttemptsService,
    private readonly quizzesResponsesService: QuizResponsesService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  create(@Body() createQuizDto: CreateQuizDto) {
    return this.quizzesService.create(createQuizDto);
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

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQuizDto: UpdateQuizDto,
  ) {
    return this.quizzesService.update(id, updateQuizDto);
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

  @Get('results/:attemptId')
  @UseGuards(JwtAuthGuard)
  getResults(
    @Param('attemptId', ParseIntPipe) attemptId: number,
    @GetUser() user,
  ) {
    return this.quizzesService.getResults(attemptId, user.id);
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
