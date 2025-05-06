import { Command, CommandRunner } from 'nest-commander';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../../entities/Course';
import { Document } from '../../entities/Document';
import { Forum } from '../../entities/Forum';
import { Category } from '../../entities/Category';
import { CourseSection } from '../../entities/CourseSection';
import { CourseLesson } from '../../entities/CourseLesson';
import { Quiz } from '../../entities/Quiz';
import { Assignment } from '../../entities/Assignment';
import { AcademicClass } from '../../entities/AcademicClass';
import { UserInstructor } from '../../entities/UserInstructor';
import { RagService } from './rag.service';
import { User } from '../../entities/User';
import { UserStudent } from '../../entities/UserStudent';
import { UserGrade } from '../../entities/UserGrade';
import { Review } from '../../entities/Review';
import { Enrollment } from '../../entities/Enrollment';
import { QuizAttempt } from '../../entities/QuizAttempt';
import { QuizQuestion } from '../../entities/QuizQuestion';
import { QuizOption } from '../../entities/QuizOption';
import { QuizResponse } from '../../entities/QuizResponse';
import { AssignmentSubmission } from '../../entities/AssignmentSubmission';
import { Certificate } from '../../entities/Certificate';

@Injectable()
@Command({
  name: 'rag:clear-vectors',
  description: 'Xóa toàn bộ vector trong Qdrant',
})
export class RagClearCommand extends CommandRunner {
  constructor(private ragService: RagService) {
    super();
  }
  async run(): Promise<void> {
    await this.ragService.clearAllVectors();
    console.log('Đã xóa toàn bộ vector!');
  }
}

@Injectable()
@Command({
  name: 'rag:import-db',
  description: 'Import all database content into RAG vector store',
})
export class RagCommand extends CommandRunner {
  private readonly logger = new Logger(RagCommand.name);

  constructor(
    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
    @InjectRepository(Document)
    private documentRepo: Repository<Document>,
    @InjectRepository(Forum)
    private forumRepo: Repository<Forum>,
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
    @InjectRepository(CourseSection)
    private courseSectionRepo: Repository<CourseSection>,
    @InjectRepository(CourseLesson)
    private courseLessonRepo: Repository<CourseLesson>,
    @InjectRepository(Quiz)
    private quizRepo: Repository<Quiz>,
    @InjectRepository(Assignment)
    private assignmentRepo: Repository<Assignment>,
    @InjectRepository(AcademicClass)
    private academicClassRepo: Repository<AcademicClass>,
    @InjectRepository(UserInstructor)
    private instructorRepo: Repository<UserInstructor>,
    private ragService: RagService,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(UserStudent)
    private userStudentRepo: Repository<UserStudent>,
    @InjectRepository(UserGrade) private userGradeRepo: Repository<UserGrade>,
    @InjectRepository(Review) private reviewRepo: Repository<Review>,
    @InjectRepository(Enrollment)
    private enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(QuizAttempt)
    private quizAttemptRepo: Repository<QuizAttempt>,
    @InjectRepository(QuizQuestion)
    private quizQuestionRepo: Repository<QuizQuestion>,
    @InjectRepository(QuizOption)
    private quizOptionRepo: Repository<QuizOption>,
    @InjectRepository(QuizResponse)
    private quizResponseRepo: Repository<QuizResponse>,
    @InjectRepository(AssignmentSubmission)
    private assignmentSubmissionRepo: Repository<AssignmentSubmission>,
    @InjectRepository(Certificate)
    private certificateRepo: Repository<Certificate>,
  ) {
    super();
  }

  async run(): Promise<void> {
    try {
      this.logger.log('Starting database import to RAG...');

      // Get all data from database
      const [
        courses,
        documents,
        forums,
        categories,
        courseSections,
        courseLessons,
        quizzes,
        assignments,
        academicClasses,
        instructors,
        users,
        userStudents,
        userGrades,
        reviews,
        enrollments,
        quizAttempts,
        quizQuestions,
        quizOptions,
        quizResponses,
        assignmentSubmissions,
        certificates,
      ] = await Promise.all([
        this.courseRepo.find({ relations: ['category'] }),
        this.documentRepo.find(),
        this.forumRepo.find(),
        this.categoryRepo.find(),
        this.courseSectionRepo.find({ relations: ['course'] }),
        this.courseLessonRepo.find({ relations: ['section'] }),
        this.quizRepo.find({ relations: ['lesson', 'academicClass'] }),
        this.assignmentRepo.find({ relations: ['lesson', 'academicClass'] }),
        this.academicClassRepo.find(),
        this.instructorRepo.find({ relations: ['user'] }),
        this.userRepo.find(),
        this.userStudentRepo.find(),
        this.userGradeRepo.find(),
        this.reviewRepo.find(),
        this.enrollmentRepo.find(),
        this.quizAttemptRepo.find(),
        this.quizQuestionRepo.find(),
        this.quizOptionRepo.find(),
        this.quizResponseRepo.find(),
        this.assignmentSubmissionRepo.find(),
        this.certificateRepo.find(),
      ]);

      // Prepare documents for RAG
      const documentsToAdd: string[] = [];

      // Add courses with their categories and more fields
      courses.forEach((course) => {
        documentsToAdd.push(
          `Khóa học: ${course.title}
Mô tả: ${course.description}
Giá: ${course.price}
Trạng thái: ${course.status}
Danh mục: ${course.category?.name || 'Chưa phân loại'}
Giảng viên: ${course.instructor?.user?.username || 'Chưa có'}`,
        );
      });

      // Add course sections
      courseSections.forEach((section) => {
        documentsToAdd.push(
          `Phần học: ${section.title}
Thuộc khóa học: ${section.course?.title || 'Không có'}
Mô tả: ${section.description}`,
        );
      });

      // Add course lessons
      courseLessons.forEach((lesson) => {
        documentsToAdd.push(
          `Bài học: ${lesson.title}
Thuộc phần: ${lesson.section?.title || 'Không có'}
Thời lượng: ${lesson.duration} phút`,
        );
      });

      // Add documents
      documents.forEach((doc) => {
        documentsToAdd.push(
          `Tài liệu: ${doc.title}
Mô tả: ${doc.description}
Loại file: ${doc.fileType || 'Không xác định'}`,
        );
      });

      // Add forums
      forums.forEach((forum) => {
        documentsToAdd.push(
          `Diễn đàn: ${forum.title}
Mô tả: ${forum.description}
Trạng thái: ${forum.status}`,
        );
      });

      // Add categories
      categories.forEach((category) => {
        documentsToAdd.push(
          `Danh mục: ${category.name}
Mô tả: ${category.description}`,
        );
      });

      // Add quizzes
      quizzes.forEach((quiz) => {
        documentsToAdd.push(
          `Bài kiểm tra: ${quiz.title}
Mô tả: ${quiz.description}
Loại bài kiểm tra: ${quiz.quizType}
Thời gian làm bài: ${quiz.timeLimit} phút
Điểm đạt: ${quiz.passingScore}
Số lần làm lại: ${quiz.attemptsAllowed}
Bài học: ${quiz.lesson?.title || 'Không có'}
Lớp học: ${quiz.academicClass?.className || 'Không có'}`,
        );
      });

      // Add assignments
      assignments.forEach((assignment) => {
        documentsToAdd.push(
          `Bài tập: ${assignment.title}
Mô tả: ${assignment.description}
Loại bài tập: ${assignment.assignmentType}
Hạn nộp: ${assignment.dueDate}
Điểm tối đa: ${assignment.maxScore}
Yêu cầu file: ${assignment.fileRequirements || 'Không có'}
Bài học: ${assignment.lesson?.title || 'Không có'}
Lớp học: ${assignment.academicClass?.className || 'Không có'}`,
        );
      });

      // Add academic classes
      academicClasses.forEach((academicClass) => {
        documentsToAdd.push(
          `Lớp học: ${academicClass.className}
Mã lớp: ${academicClass.classCode}
Học kỳ: ${academicClass.semester}
Trạng thái: ${academicClass.status}`,
        );
      });

      // Add instructors
      instructors.forEach((instructor) => {
        documentsToAdd.push(
          `Giảng viên: ${instructor.user.username}
Email: ${instructor.user.email}
Số điện thoại: ${instructor.user.phone || 'Chưa cập nhật'}`,
        );
      });

      // Add users
      users.forEach((user) => {
        documentsToAdd.push(
          `Người dùng: ${user.username}
Email: ${user.email}
Số điện thoại: ${user.phone || 'Chưa cập nhật'}
Vai trò: ${user.role}`,
        );
      });

      // Add user students
      userStudents.forEach((student) => {
        documentsToAdd.push(
          `Học viên: ${student.user?.username || 'Không rõ'}
Email: ${student.user?.email || 'Không rõ'}`,
        );
      });

      // Add user grades
      userGrades.forEach((grade) => {
        documentsToAdd.push(
          `Điểm: ${grade.score}
Loại điểm: ${grade.gradeType}`,
        );
      });

      // Add reviews
      reviews.forEach((review) => {
        documentsToAdd.push(
          `Đánh giá: ${review.rating} sao
Nội dung: ${review.reviewText}`,
        );
      });

      // Add enrollments
      enrollments.forEach((enroll) => {
        documentsToAdd.push(`Ghi danh: Trạng thái: ${enroll.status}`);
      });

      // Add quiz attempts
      quizAttempts.forEach((attempt) => {
        documentsToAdd.push(
          `Lần làm bài kiểm tra: Điểm: ${attempt.score}
Trạng thái: ${attempt.status}`,
        );
      });

      // Add quiz questions
      quizQuestions.forEach((question) => {
        documentsToAdd.push(`Câu hỏi: ${question.questionText}`);
      });

      // Add quiz options
      quizOptions.forEach((option) => {
        documentsToAdd.push(
          `Lựa chọn: ${option.optionText}
Đúng/Sai: ${option.isCorrect ? 'Đúng' : 'Sai'}`,
        );
      });

      // Add quiz responses
      quizResponses.forEach((response) => {
        documentsToAdd.push(`Trả lời kiểm tra: ID: ${response.id}`);
      });

      // Add assignment submissions
      assignmentSubmissions.forEach((submission) => {
        documentsToAdd.push(`Nộp bài tập: Trạng thái: ${submission.status}`);
      });

      // Add certificates
      certificates.forEach((cert) => {
        documentsToAdd.push(
          `Chứng chỉ: ID: ${cert.id}
Ngày cấp: ${cert.issueDate}`,
        );
      });

      this.logger.log(`Found ${documentsToAdd.length} documents to add`);

      // Add to RAG
      await this.ragService.addDocuments(documentsToAdd);

      this.logger.log('Successfully imported all database content to RAG');
    } catch (error) {
      this.logger.error('Error importing database content:', error);
      throw error;
    }
  }
}
