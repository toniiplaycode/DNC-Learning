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
  HttpException,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
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
import { AutoQuizGeneratorService } from './auto-quiz-generator.service';
import { FileInterceptor } from '@nestjs/platform-express';
import * as pdf from 'pdf-parse';
import * as mammoth from 'mammoth';
import { QuestionType } from 'src/entities/QuizQuestion';

@Controller('quizzes')
export class QuizzesController {
  constructor(
    private readonly quizzesService: QuizzesService,
    private readonly quizzesAttemptsService: QuizAttemptsService,
    private readonly quizzesResponsesService: QuizResponsesService,
    private readonly autoQuizGeneratorService: AutoQuizGeneratorService,
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

  @Patch('show-explanation/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  updateShowExplanation(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQuizDto: any,
  ) {
    console.log(id, updateQuizDto);
    return this.quizzesService.updateShowExplanation(id, updateQuizDto);
  }

  @Post('generate-from-file')
  @UseInterceptors(FileInterceptor('file'))
  async generateQuizFromFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('numQuestions') numQuestions: number = 5,
    @Body('lessonId') lessonId: number,
  ) {
    const fileType = file.originalname.split('.').pop() || 'txt';
    const questions = await this.autoQuizGeneratorService.generateQuizFromFile(
      file.buffer,
      fileType,
      numQuestions,
    );

    // Tạo quiz mới trước (nếu cần)
    const quiz = await this.quizzesService.create({
      title: `Auto-generated Quiz from ${file.originalname}`,
      description: 'Quiz automatically generated from uploaded content',
      lessonId,
    });

    // Lưu từng câu hỏi vào DB
    for (const [index, q] of questions.questions.entries()) {
      await this.quizzesService.createQuestion({
        quizId: quiz.id,
        questionText: q.question,
        questionType: QuestionType.MULTIPLE_CHOICE,
        correctExplanation: q.explanation,
        orderNumber: index + 1,
        options: q.options.map((opt: string, idx: number) => ({
          optionText: opt,
          isCorrect: opt === q.correctAnswer,
          orderNumber: idx + 1,
        })),
      });
    }

    // Lấy lại quiz đã có đủ câu hỏi và options
    const quizWithQuestions = await this.quizzesService.findOne(quiz.id);

    return {
      success: true,
      quiz: quizWithQuestions,
      sourceFile: file.originalname,
      generatedAt: new Date(),
    };
  }

  async extractTextFromBuffer(
    fileBuffer: Buffer,
    fileType: string,
  ): Promise<string> {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        const pdfData = await pdf(fileBuffer);
        return pdfData.text;
      case 'docx':
        const docxResult = await mammoth.extractRawText({ buffer: fileBuffer });
        return docxResult.value;
      case 'txt':
        return fileBuffer.toString('utf-8');
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  }
}
