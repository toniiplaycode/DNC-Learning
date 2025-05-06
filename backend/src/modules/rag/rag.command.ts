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
      const courseDocs: string[] = [];
      courses.forEach((course) => {
        const keywords = [
          course.title,
          course.title?.toLowerCase(),
          course.title?.replace('Lập trình', 'Học'),
          course.title?.replace('Python', 'Py'),
          'khóa học ' + course.title,
          'học ' + course.title,
          `Khóa học này giúp bạn làm chủ ${course.title}`,
          `Tìm hiểu ${course.title} cho người mới bắt đầu`,
          `Học ${course.title} nâng cao và thực hành`,
        ]
          .filter(Boolean)
          .join(', ');

        courseDocs.push(
          `Khóa học: ${course.title}
Mô tả: ${course.description}
Từ khóa phụ: ${keywords}
Giá: ${course.price}
Trạng thái: ${course.status}
Danh mục: ${course.category?.name || 'Chưa phân loại'}
Giảng viên: ${course.instructor?.user?.username || 'Chưa có'}
Thống kê:
- Tổng số khóa học: ${courses.length}
- Số khóa học có danh mục: ${courses.filter((c) => c.category).length}
- Số khóa học có giảng viên: ${courses.filter((c) => c.instructor).length}
- Số khóa học đang hoạt động: ${courses.filter((c) => c.status === 'published').length}
- Giá trung bình: ${Math.round(courses.reduce((sum, c) => sum + (c.price || 0), 0) / courses.length)}`,
        );
      });
      documentsToAdd.push(...courseDocs);
      this.logger.log(`Added ${courseDocs.length} course documents`);

      // Add course sections
      const sectionDocs: string[] = [];
      courseSections.forEach((section) => {
        const keywords = [
          section.title,
          section.title?.toLowerCase(),
          'phần học ' + section.title,
          'section ' + section.title,
          section.course?.title ? `thuộc khóa học ${section.course.title}` : '',
        ]
          .filter(Boolean)
          .join(', ');

        sectionDocs.push(
          `Phần học: ${section.title}
Thuộc khóa học: ${section.course?.title || 'Không có'}
Mô tả: ${section.description}
Từ khóa phụ: ${keywords}
Thống kê:
- Tổng số phần học: ${courseSections.length}
- Số phần học có khóa học: ${courseSections.filter((s) => s.course).length}
- Số phần học có mô tả: ${courseSections.filter((s) => s.description).length}`,
        );
      });
      documentsToAdd.push(...sectionDocs);
      this.logger.log(`Added ${sectionDocs.length} section documents`);

      // Add course lessons
      const lessonDocs: string[] = [];
      courseLessons.forEach((lesson) => {
        const keywords = [
          lesson.title,
          lesson.title?.toLowerCase(),
          'bài học ' + lesson.title,
          'lesson ' + lesson.title,
          lesson.section?.title ? `thuộc phần ${lesson.section.title}` : '',
        ]
          .filter(Boolean)
          .join(', ');

        lessonDocs.push(
          `Bài học: ${lesson.title}
Thuộc phần: ${lesson.section?.title || 'Không có'}
Thời lượng: ${lesson.duration} phút
Từ khóa phụ: ${keywords}
Thống kê:
- Tổng số bài học: ${courseLessons.length}
- Số bài học có phần: ${courseLessons.filter((l) => l.section).length}
- Thời lượng trung bình: ${Math.round(courseLessons.reduce((sum, l) => sum + (l.duration || 0), 0) / courseLessons.length)} phút`,
        );
      });
      documentsToAdd.push(...lessonDocs);
      this.logger.log(`Added ${lessonDocs.length} lesson documents`);

      // Add documents
      const docDocs: string[] = [];
      documents.forEach((doc) => {
        const keywords = [
          doc.title,
          doc.title?.toLowerCase(),
          'tài liệu ' + doc.title,
          doc.fileType ? `loại file ${doc.fileType}` : '',
        ]
          .filter(Boolean)
          .join(', ');

        docDocs.push(
          `Tài liệu: ${doc.title}
Mô tả: ${doc.description}
Từ khóa phụ: ${keywords}
Thống kê:
- Tổng số tài liệu: ${documents.length}
- Số tài liệu có loại file: ${documents.filter((d) => d.fileType).length}
- Số tài liệu có mô tả: ${documents.filter((d) => d.description).length}`,
        );
      });
      documentsToAdd.push(...docDocs);
      this.logger.log(`Added ${docDocs.length} document files`);

      // Add forums
      const forumDocs: string[] = [];
      forums.forEach((forum) => {
        const keywords = [
          forum.title,
          forum.title?.toLowerCase(),
          'diễn đàn ' + forum.title,
          forum.status,
        ]
          .filter(Boolean)
          .join(', ');

        forumDocs.push(
          `Diễn đàn: ${forum.title}
Mô tả: ${forum.description}
Trạng thái: ${forum.status}
Từ khóa phụ: ${keywords}
Thống kê:
- Tổng số diễn đàn: ${forums.length}
- Số diễn đàn đang hoạt động: ${forums.filter((f) => f.status === 'active').length}
- Số diễn đàn có mô tả: ${forums.filter((f) => f.description).length}`,
        );
      });
      documentsToAdd.push(...forumDocs);
      this.logger.log(`Added ${forumDocs.length} forum documents`);

      // Add categories
      const categoryDocs: string[] = [];
      categories.forEach((category) => {
        const keywords = [
          category.name,
          category.name?.toLowerCase(),
          'danh mục ' + category.name,
        ]
          .filter(Boolean)
          .join(', ');

        categoryDocs.push(
          `Danh mục: ${category.name}
Mô tả: ${category.description}
Từ khóa phụ: ${keywords}
Thống kê:
- Tổng số danh mục: ${categories.length}
- Số danh mục có mô tả: ${categories.filter((c) => c.description).length}`,
        );
      });
      documentsToAdd.push(...categoryDocs);
      this.logger.log(`Added ${categoryDocs.length} category documents`);

      // Add quizzes
      const quizDocs: string[] = [];
      quizzes.forEach((quiz) => {
        const keywords = [
          quiz.title,
          quiz.title?.toLowerCase(),
          'bài kiểm tra ' + quiz.title,
          quiz.quizType,
          quiz.lesson?.title ? `bài học ${quiz.lesson.title}` : '',
          quiz.academicClass?.className
            ? `lớp ${quiz.academicClass.className}`
            : '',
        ]
          .filter(Boolean)
          .join(', ');

        quizDocs.push(
          `Bài kiểm tra: ${quiz.title}
Mô tả: ${quiz.description}
Loại bài kiểm tra: ${quiz.quizType}
Thời gian làm bài: ${quiz.timeLimit} phút
Điểm đạt: ${quiz.passingScore}
Số lần làm lại: ${quiz.attemptsAllowed}
Bài học: ${quiz.lesson?.title || 'Không có'}
Lớp học: ${quiz.academicClass?.className || 'Không có'}
Từ khóa phụ: ${keywords}
Thống kê:
- Tổng số bài kiểm tra: ${quizzes.length}
- Số bài kiểm tra có bài học: ${quizzes.filter((q) => q.lesson).length}
- Số bài kiểm tra có lớp học: ${quizzes.filter((q) => q.academicClass).length}
- Thời gian làm bài trung bình: ${Math.round(quizzes.reduce((sum, q) => sum + (q.timeLimit || 0), 0) / quizzes.length)} phút
- Điểm đạt trung bình: ${Math.round(quizzes.reduce((sum, q) => sum + (q.passingScore || 0), 0) / quizzes.length)}`,
        );
      });
      documentsToAdd.push(...quizDocs);
      this.logger.log(`Added ${quizDocs.length} quiz documents`);

      // Add assignments
      const assignmentDocs: string[] = [];
      assignments.forEach((assignment) => {
        const keywords = [
          assignment.title,
          assignment.title?.toLowerCase(),
          'bài tập ' + assignment.title,
          assignment.assignmentType,
          assignment.lesson?.title ? `bài học ${assignment.lesson.title}` : '',
          assignment.academicClass?.className
            ? `lớp ${assignment.academicClass.className}`
            : '',
        ]
          .filter(Boolean)
          .join(', ');

        assignmentDocs.push(
          `Bài tập: ${assignment.title}
Mô tả: ${assignment.description}
Loại bài tập: ${assignment.assignmentType}
Hạn nộp: ${assignment.dueDate}
Điểm tối đa: ${assignment.maxScore}
Yêu cầu file: ${assignment.fileRequirements || 'Không có'}
Bài học: ${assignment.lesson?.title || 'Không có'}
Lớp học: ${assignment.academicClass?.className || 'Không có'}
Từ khóa phụ: ${keywords}
Thống kê:
- Tổng số bài tập: ${assignments.length}
- Số bài tập có bài học: ${assignments.filter((a) => a.lesson).length}
- Số bài tập có lớp học: ${assignments.filter((a) => a.academicClass).length}
- Điểm tối đa trung bình: ${Math.round(assignments.reduce((sum, a) => sum + (a.maxScore || 0), 0) / assignments.length)}`,
        );
      });
      documentsToAdd.push(...assignmentDocs);
      this.logger.log(`Added ${assignmentDocs.length} assignment documents`);

      // Add academic classes
      const classDocs: string[] = [];
      academicClasses.forEach((academicClass) => {
        const keywords = [
          academicClass.className,
          academicClass.className?.toLowerCase(),
          'lớp học ' + academicClass.className,
          academicClass.classCode,
          academicClass.semester,
        ]
          .filter(Boolean)
          .join(', ');

        classDocs.push(
          `Lớp học: ${academicClass.className}
Mã lớp: ${academicClass.classCode}
Học kỳ: ${academicClass.semester}
Trạng thái: ${academicClass.status}
Từ khóa phụ: ${keywords}
Thống kê:
- Tổng số lớp học: ${academicClasses.length}
- Số lớp học đang hoạt động: ${academicClasses.filter((c) => c.status === 'active').length}
- Số lớp học theo học kỳ: ${Object.entries(
            academicClasses.reduce((acc, c) => {
              acc[c.semester] = (acc[c.semester] || 0) + 1;
              return acc;
            }, {}),
          )
            .map(([semester, count]) => `${semester}: ${count}`)
            .join(', ')}`,
        );
      });
      documentsToAdd.push(...classDocs);
      this.logger.log(`Added ${classDocs.length} academic class documents`);

      // Add instructors
      const instructorDocs: string[] = [];
      instructors.forEach((instructor) => {
        const keywords = [
          instructor.user.username,
          instructor.user.username?.toLowerCase(),
          'giảng viên ' + instructor.user.username,
          instructor.user.email,
        ]
          .filter(Boolean)
          .join(', ');

        instructorDocs.push(
          `Giảng viên: ${instructor.user.username}
Email: ${instructor.user.email}
Số điện thoại: ${instructor.user.phone || 'Chưa cập nhật'}
Từ khóa phụ: ${keywords}
Thống kê:
- Tổng số giảng viên: ${instructors.length}
- Số giảng viên có số điện thoại: ${instructors.filter((i) => i.user.phone).length}
- Số giảng viên có email: ${instructors.filter((i) => i.user.email).length}`,
        );
      });
      documentsToAdd.push(...instructorDocs);
      this.logger.log(`Added ${instructorDocs.length} instructor documents`);

      // Add users
      const userDocs: string[] = [];
      users.forEach((user) => {
        const keywords = [
          user.username,
          user.username?.toLowerCase(),
          'người dùng ' + user.username,
          user.email,
          user.role,
        ]
          .filter(Boolean)
          .join(', ');

        userDocs.push(
          `Người dùng: ${user.username}
Email: ${user.email}
Số điện thoại: ${user.phone || 'Chưa cập nhật'}
Vai trò: ${user.role}
Từ khóa phụ: ${keywords}
Thống kê:
- Tổng số người dùng: ${users.length}
- Số người dùng có số điện thoại: ${users.filter((u) => u.phone).length}
- Số người dùng có email: ${users.filter((u) => u.email).length}
- Phân bố theo vai trò: ${Object.entries(
            users.reduce((acc, u) => {
              acc[u.role] = (acc[u.role] || 0) + 1;
              return acc;
            }, {}),
          )
            .map(([role, count]) => `${role}: ${count}`)
            .join(', ')}`,
        );
      });
      documentsToAdd.push(...userDocs);
      this.logger.log(`Added ${userDocs.length} user documents`);

      // Add user students
      const studentDocs: string[] = [];
      userStudents.forEach((student) => {
        const keywords = [
          student.user?.username,
          student.user?.username?.toLowerCase(),
          'học viên ' + (student.user?.username || ''),
          student.user?.email,
        ]
          .filter(Boolean)
          .join(', ');

        studentDocs.push(
          `Học viên: ${student.user?.username || 'Không rõ'}
Email: ${student.user?.email || 'Không rõ'}
Từ khóa phụ: ${keywords}
Thống kê:
- Tổng số học viên: ${userStudents.length}
- Số học viên có email: ${userStudents.filter((s) => s.user?.email).length}
- Số học viên có username: ${userStudents.filter((s) => s.user?.username).length}`,
        );
      });
      documentsToAdd.push(...studentDocs);
      this.logger.log(`Added ${studentDocs.length} student documents`);

      // Add user grades
      const gradeDocs: string[] = [];
      userGrades.forEach((grade) => {
        const keywords = [
          grade.gradeType,
          'điểm ' + grade.gradeType,
          String(grade.score),
        ]
          .filter(Boolean)
          .join(', ');

        gradeDocs.push(
          `Điểm: ${grade.score}
Loại điểm: ${grade.gradeType}
Từ khóa phụ: ${keywords}
Thống kê:
- Tổng số điểm: ${userGrades.length}
- Số điểm có giá trị: ${userGrades.filter((g) => g.score).length}
- Điểm trung bình: ${Math.round(userGrades.reduce((sum, g) => sum + (g.score || 0), 0) / userGrades.length)}
- Phân bố theo loại điểm: ${Object.entries(
            userGrades.reduce((acc, g) => {
              acc[g.gradeType] = (acc[g.gradeType] || 0) + 1;
              return acc;
            }, {}),
          )
            .map(([type, count]) => `${type}: ${count}`)
            .join(', ')}`,
        );
      });
      documentsToAdd.push(...gradeDocs);
      this.logger.log(`Added ${gradeDocs.length} grade documents`);

      // Add reviews
      const reviewDocs: string[] = [];
      reviews.forEach((review) => {
        const keywords = [
          String(review.rating) + ' sao',
          review.reviewText,
          'đánh giá',
        ]
          .filter(Boolean)
          .join(', ');

        reviewDocs.push(
          `Đánh giá: ${review.rating} sao
Nội dung: ${review.reviewText}
Từ khóa phụ: ${keywords}
Thống kê:
- Tổng số đánh giá: ${reviews.length}
- Số đánh giá có nội dung: ${reviews.filter((r) => r.reviewText).length}
- Đánh giá trung bình: ${(reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)} sao
- Phân bố theo số sao: ${Object.entries(
            reviews.reduce((acc, r) => {
              acc[r.rating] = (acc[r.rating] || 0) + 1;
              return acc;
            }, {}),
          )
            .map(([rating, count]) => `${rating} sao: ${count}`)
            .join(', ')}`,
        );
      });
      documentsToAdd.push(...reviewDocs);
      this.logger.log(`Added ${reviewDocs.length} review documents`);

      // Add enrollments
      const enrollmentDocs: string[] = [];
      enrollments.forEach((enroll) => {
        const keywords = [enroll.status, 'ghi danh'].filter(Boolean).join(', ');

        enrollmentDocs.push(`Ghi danh: Trạng thái: ${enroll.status}
Từ khóa phụ: ${keywords}
Thống kê:
- Tổng số ghi danh: ${enrollments.length}
- Số ghi danh đang hoạt động: ${enrollments.filter((e) => e.status === 'active').length}
- Phân bố theo trạng thái: ${Object.entries(
          enrollments.reduce((acc, e) => {
            acc[e.status] = (acc[e.status] || 0) + 1;
            return acc;
          }, {}),
        )
          .map(([status, count]) => `${status}: ${count}`)
          .join(', ')}`);
      });
      documentsToAdd.push(...enrollmentDocs);
      this.logger.log(`Added ${enrollmentDocs.length} enrollment documents`);

      // Add quiz attempts
      const attemptDocs: string[] = [];
      quizAttempts.forEach((attempt) => {
        const keywords = [
          String(attempt.score),
          attempt.status,
          'làm bài kiểm tra',
        ]
          .filter(Boolean)
          .join(', ');

        attemptDocs.push(
          `Lần làm bài kiểm tra: Điểm: ${attempt.score}
Trạng thái: ${attempt.status}
Từ khóa phụ: ${keywords}
Thống kê:
- Tổng số lần làm bài: ${quizAttempts.length}
- Số lần làm bài đã hoàn thành: ${quizAttempts.filter((a) => a.status === 'completed').length}
- Điểm trung bình: ${Math.round(quizAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / quizAttempts.length)}
- Phân bố theo trạng thái: ${Object.entries(
            quizAttempts.reduce((acc, a) => {
              acc[a.status] = (acc[a.status] || 0) + 1;
              return acc;
            }, {}),
          )
            .map(([status, count]) => `${status}: ${count}`)
            .join(', ')}`,
        );
      });
      documentsToAdd.push(...attemptDocs);
      this.logger.log(`Added ${attemptDocs.length} quiz attempt documents`);

      // Add quiz questions
      const questionDocs: string[] = [];
      quizQuestions.forEach((question) => {
        const keywords = [
          question.questionText,
          question.questionText?.toLowerCase(),
          'câu hỏi',
        ]
          .filter(Boolean)
          .join(', ');

        questionDocs.push(`Câu hỏi: ${question.questionText}
Từ khóa phụ: ${keywords}
Thống kê:
- Tổng số câu hỏi: ${quizQuestions.length}
- Số câu hỏi có nội dung: ${quizQuestions.filter((q) => q.questionText).length}
- Số câu hỏi có đáp án: ${quizQuestions.filter((q) => q.options?.length > 0).length}`);
      });
      documentsToAdd.push(...questionDocs);
      this.logger.log(`Added ${questionDocs.length} quiz question documents`);

      // Add quiz options
      const optionDocs: string[] = [];
      quizOptions.forEach((option) => {
        const keywords = [
          option.optionText,
          option.optionText?.toLowerCase(),
          option.isCorrect ? 'đáp án đúng' : 'đáp án sai',
        ]
          .filter(Boolean)
          .join(', ');

        optionDocs.push(
          `Lựa chọn: ${option.optionText}
Đúng/Sai: ${option.isCorrect ? 'Đúng' : 'Sai'}
Từ khóa phụ: ${keywords}
Thống kê:
- Tổng số lựa chọn: ${quizOptions.length}
- Số lựa chọn đúng: ${quizOptions.filter((o) => o.isCorrect).length}
- Số lựa chọn sai: ${quizOptions.filter((o) => !o.isCorrect).length}
- Tỷ lệ lựa chọn đúng: ${((quizOptions.filter((o) => o.isCorrect).length / quizOptions.length) * 100).toFixed(1)}%`,
        );
      });
      documentsToAdd.push(...optionDocs);
      this.logger.log(`Added ${optionDocs.length} quiz option documents`);

      // Add quiz responses
      const responseDocs: string[] = [];
      quizResponses.forEach((response) => {
        const keywords = [String(response.id), 'trả lời kiểm tra']
          .filter(Boolean)
          .join(', ');

        responseDocs.push(`Trả lời kiểm tra: ID: ${response.id}
Từ khóa phụ: ${keywords}
Thống kê:
- Tổng số trả lời: ${quizResponses.length}`);
      });
      documentsToAdd.push(...responseDocs);
      this.logger.log(`Added ${responseDocs.length} quiz response documents`);

      // Add assignment submissions
      const submissionDocs: string[] = [];
      assignmentSubmissions.forEach((submission) => {
        const keywords = [submission.status, 'nộp bài tập']
          .filter(Boolean)
          .join(', ');

        submissionDocs.push(`Nộp bài tập: Trạng thái: ${submission.status}
Từ khóa phụ: ${keywords}
Thống kê:
- Tổng số bài nộp: ${assignmentSubmissions.length}
- Phân bố theo trạng thái: ${Object.entries(
          assignmentSubmissions.reduce((acc, s) => {
            acc[s.status] = (acc[s.status] || 0) + 1;
            return acc;
          }, {}),
        )
          .map(([status, count]) => `${status}: ${count}`)
          .join(', ')}`);
      });
      documentsToAdd.push(...submissionDocs);
      this.logger.log(
        `Added ${submissionDocs.length} assignment submission documents`,
      );

      // Add certificates
      const certificateDocs: string[] = [];
      certificates.forEach((cert) => {
        const keywords = [String(cert.id), 'chứng chỉ', cert.issueDate]
          .filter(Boolean)
          .join(', ');

        certificateDocs.push(
          `Chứng chỉ: ID: ${cert.id}
Ngày cấp: ${cert.issueDate}
Từ khóa phụ: ${keywords}
Thống kê:
- Tổng số chứng chỉ: ${certificates.length}
- Số chứng chỉ theo năm: ${Object.entries(
            certificates.reduce((acc, c) => {
              const year = new Date(c.issueDate).getFullYear();
              acc[year] = (acc[year] || 0) + 1;
              return acc;
            }, {}),
          )
            .map(([year, count]) => `${year}: ${count}`)
            .join(', ')}`,
        );
      });
      documentsToAdd.push(...certificateDocs);
      this.logger.log(`Added ${certificateDocs.length} certificate documents`);

      this.logger.log(`Found ${documentsToAdd.length} total documents to add`);

      // Add to RAG
      await this.ragService.addDocuments(documentsToAdd);

      this.logger.log('Successfully imported all database content to RAG');
    } catch (error) {
      this.logger.error('Error importing database content:', error);
      throw error;
    }
  }
}
