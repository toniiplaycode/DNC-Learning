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
import { UserGrade } from '../../entities/UserGrade';
import { Review } from '../../entities/Review';
import { Enrollment } from '../../entities/Enrollment';
import { Faculty } from '../../entities/Faculty';
import { Major } from '../../entities/Major';
import { Program } from '../../entities/Program';
import { ProgramCourse } from '../../entities/ProgramCourse';

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
    @InjectRepository(UserGrade) private userGradeRepo: Repository<UserGrade>,
    @InjectRepository(Review) private reviewRepo: Repository<Review>,
    @InjectRepository(Enrollment)
    private enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(Faculty) private facultyRepo: Repository<Faculty>,
    @InjectRepository(Major) private majorRepo: Repository<Major>,
    @InjectRepository(Program) private programRepo: Repository<Program>,
    @InjectRepository(ProgramCourse)
    private programCourseRepo: Repository<ProgramCourse>,
  ) {
    super();
  }

  async run(): Promise<void> {
    try {
      this.logger.log('Bắt đầu nhập dữ liệu từ cơ sở dữ liệu vào RAG...');

      // Get all data from database with correct relations
      this.logger.log('Đang lấy dữ liệu từ cơ sở dữ liệu...');
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
        userGrades,
        reviews,
        enrollments,
        faculties,
        majors,
        programs,
        programCourses,
      ] = await Promise.all([
        this.courseRepo.find({
          relations: [
            'category',
            'instructor',
            'instructor.user',
            'sections',
            'sections.lessons',
            'sections.lessons.quizzes',
            'sections.lessons.assignments',
            'sections.documents',
            'reviews',
            'reviews.student',
            'reviews.student.user',
            'enrollments',
            'enrollments.user',
          ],
        }),
        this.documentRepo.find({
          relations: [
            'instructor',
            'instructor.user',
            'courseSection',
            'courseSection.course',
          ],
        }),
        this.forumRepo.find({ relations: ['course', 'user'] }),
        this.categoryRepo.find(),
        this.courseSectionRepo.find({
          relations: ['course', 'documents', 'lessons'],
        }),
        this.courseLessonRepo.find({
          relations: ['section', 'quizzes', 'assignments'],
        }),
        this.quizRepo.find({
          relations: [
            'lesson',
            'academicClass',
            'questions',
            'questions.options',
          ],
        }),
        this.assignmentRepo.find({
          relations: ['lesson', 'academicClass'],
        }),
        this.academicClassRepo.find({
          relations: [
            'major',
            'program',
            'instructors',
            'instructors.instructor',
            'instructors.instructor.user',
            'studentsAcademic',
            'studentsAcademic.user',
            'classCourses',
            'classCourses.course',
          ],
        }),
        this.instructorRepo.find({
          relations: [
            'user',
            'faculty',
            'documents',
            'courses',
            'courses.category',
          ],
        }),
        this.userRepo.find(),
        this.userGradeRepo.find({
          relations: [
            'user',
            'course',
            'lesson',
            'instructor',
            'instructor.user',
          ],
        }),
        this.reviewRepo.find({
          relations: ['course', 'student', 'student.user'],
        }),
        this.enrollmentRepo.find({
          relations: ['course', 'user'],
        }),
        this.facultyRepo.find({
          relations: ['majors', 'userInstructors'],
        }),
        this.majorRepo.find({
          relations: ['faculty', 'programs', 'academicClasses'],
        }),
        this.programRepo.find({
          relations: ['major', 'programCourses', 'academicClasses'],
        }),
        this.programCourseRepo.find({
          relations: ['program', 'course'],
        }),
      ]);

      this.logger.log(
        'Đã lấy dữ liệu thành công, đang chuẩn bị tài liệu cho RAG...',
      );

      // Prepare documents for RAG
      const documentsToAdd: string[] = [];

      // Thêm thông tin giới thiệu hệ thống DNC
      const systemIntroDocs = [
        `Hệ thống DNC Learning Platform
Tên hệ thống: DNC Learning Platform
Chủ sở hữu: Lê Thanh Toàn
Mô tả: Hệ thống học tập trực tuyến tích hợp đầy đủ tính năng cho việc quản lý khóa học, giảng dạy và học tập
Loại hệ thống: E-Learning Platform
Đối tượng sử dụng: Học viên, Giảng viên, Quản trị viên`,

        `Từ khóa hệ thống: DNC, DNC Learning, Learning Platform, E-Learning, Học trực tuyến, Lê Thanh Toàn, Hệ thống giáo dục, Platform học tập
Liên quan đến: DNC Learning Platform`,

        `Tính năng chính hệ thống DNC:
- Quản lý khóa học và bài giảng
- Hệ thống bài tập và kiểm tra
- Diễn đàn thảo luận
- Quản lý lớp học và học viên
- Hệ thống đánh giá và chứng chỉ
- Chatbot hỗ trợ học tập
- Quản lý tài liệu và tài nguyên học tập`,

        `Thông tin chủ sở hữu:
Tên: Lê Thanh Toàn
Vai trò: Chủ sở hữu hệ thống DNC Learning Platform
Hệ thống: DNC Learning Platform
Mô tả: Hệ thống học tập trực tuyến toàn diện với đầy đủ tính năng hỗ trợ việc dạy và học`,
      ];

      documentsToAdd.push(...systemIntroDocs);
      this.logger.log(
        `Added ${systemIntroDocs.length} system introduction documents`,
      );

      // Add courses with their categories and more fields
      this.logger.log(`Đang xử lý ${courses.length} khóa học...`);
      const courseDocs: string[] = [];
      courses.forEach((course) => {
        // Tạo document chính cho khóa học với thông tin chi tiết
        const courseMainDoc = `Khóa học: ${course.title}
Mô tả: ${course.description || 'Không có mô tả'}
Giá: ${course.price}
Danh mục: ${course.category?.name || 'Chưa phân loại'}
Giảng viên: ${course.instructor?.user?.username || 'Chưa có'}
Email giảng viên: ${course.instructor?.user?.email || 'Chưa có'}
Trình độ: ${course.level || 'Chưa xác định'}
Trạng thái: ${course.status || 'Chưa xác định'}
URL: ${process.env.JAVASCRIPT_ORIGINS}/course/${course.id}`;

        // Thêm thông tin sections nếu có
        let sectionsInfo = '';
        if (course.sections && course.sections.length > 0) {
          sectionsInfo = `\nPhần học (${course.sections.length} phần):`;
          course.sections.forEach((section, index) => {
            sectionsInfo += `\n- Phần ${index + 1}: ${section.title}`;
            if (section.description) {
              sectionsInfo += ` (${section.description})`;
            }

            // Thêm thông tin lessons trong section
            if (section.lessons && section.lessons.length > 0) {
              sectionsInfo += `\n  + ${section.lessons.length} bài học:`;
              section.lessons.forEach((lesson, lessonIndex) => {
                sectionsInfo += `\n    * Bài ${lessonIndex + 1}: ${lesson.title} `;
              });
            }
          });
        }

        // Thêm thông tin documents từ sections nếu có
        let documentsInfo = '';
        if (course.sections) {
          const allDocuments: any[] = [];
          course.sections.forEach((section) => {
            if (section.documents && section.documents.length > 0) {
              allDocuments.push(...section.documents);
            }
          });

          if (allDocuments.length > 0) {
            documentsInfo = `\nTài liệu khóa học (${allDocuments.length} tài liệu):`;
            allDocuments.forEach((doc, index) => {
              documentsInfo += `\n- Tài liệu ${index + 1}: ${doc.title}`;
              if (doc.description) {
                documentsInfo += ` (${doc.description})`;
              }
              if (doc.fileType) {
                documentsInfo += ` [${doc.fileType}]`;
              }
              if (doc.instructor?.user?.username) {
                documentsInfo += ` - Upload bởi: ${doc.instructor.user.username}`;
              }
            });
          }
        }

        // Thêm thông tin reviews nếu có
        let reviewsInfo = '';
        if (course.reviews && course.reviews.length > 0) {
          const avgRating = (
            course.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
            course.reviews.length
          ).toFixed(1);
          reviewsInfo = `\nĐánh giá: ${avgRating} sao (${course.reviews.length} đánh giá)`;

          // Thêm một số đánh giá mẫu
          const sampleReviews = course.reviews.slice(0, 3);
          if (sampleReviews.length > 0) {
            reviewsInfo += `\nMột số đánh giá:`;
            sampleReviews.forEach((review, index) => {
              reviewsInfo += `\n- ${review.rating} sao: ${review.reviewText || 'Không có nội dung'}`;
              if (review.student?.user?.username) {
                reviewsInfo += ` (${review.student.user.username})`;
              }
            });
          }
        }

        // Thêm thông tin enrollments nếu có
        let enrollmentsInfo = '';
        if (course.enrollments && course.enrollments.length > 0) {
          const activeEnrollments = course.enrollments.filter(
            (e) => e.status === 'active',
          ).length;
          enrollmentsInfo = `\nSố học viên đăng ký: ${activeEnrollments}/${course.enrollments.length}`;
        }

        courseDocs.push(
          courseMainDoc +
            sectionsInfo +
            documentsInfo +
            reviewsInfo +
            enrollmentsInfo,
        );

        // Tạo document riêng cho từ khóa
        const keywords = [
          course.title,
          course.title?.toLowerCase(),
          course.title?.replace('Lập trình', 'Học'),
          course.title?.replace('Python', 'Py'),
          'khóa học ' + course.title,
          'học ' + course.title,
          course.category?.name,
          course.instructor?.user?.username,
        ].filter(Boolean);

        if (keywords.length > 0) {
          courseDocs.push(
            `Từ khóa khóa học: ${keywords.join(', ')}
Liên quan đến: ${course.title}`,
          );
        }

        // Tạo documents riêng cho từng section
        if (course.sections && course.sections.length > 0) {
          course.sections.forEach((section) => {
            const sectionDoc = `Phần học: ${section.title}
Thuộc khóa học: ${course.title}
Mô tả: ${section.description || 'Không có mô tả'}`;

            // Thêm thông tin lessons trong section
            let lessonsInfo = '';
            if (section.lessons && section.lessons.length > 0) {
              lessonsInfo = `\nBài học (${section.lessons.length} bài):`;
              section.lessons.forEach((lesson, index) => {
                lessonsInfo += `\n- Bài ${index + 1}: ${lesson.title} (${lesson.duration || 0} phút)`;
              });
            }

            courseDocs.push(sectionDoc + lessonsInfo);

            // Tạo document từ khóa cho section
            const sectionKeywords = [
              section.title,
              section.title?.toLowerCase(),
              'phần học ' + section.title,
              'section ' + section.title,
              course.title,
            ].filter(Boolean);

            if (sectionKeywords.length > 0) {
              courseDocs.push(
                `Từ khóa phần học: ${sectionKeywords.join(', ')}
Liên quan đến: ${section.title} (${course.title})`,
              );
            }
          });
        }

        // Tạo documents riêng cho từng lesson
        if (course.sections) {
          course.sections.forEach((section) => {
            if (section.lessons && section.lessons.length > 0) {
              section.lessons.forEach((lesson) => {
                const lessonDoc = `Bài học: ${lesson.title}
Thuộc phần: ${section.title}
Thuộc khóa học: ${course.title}
Thời lượng: ${lesson.duration || 0} phút`;

                courseDocs.push(lessonDoc);

                // Tạo document từ khóa cho lesson
                const lessonKeywords = [
                  lesson.title,
                  lesson.title?.toLowerCase(),
                  'bài học ' + lesson.title,
                  'lesson ' + lesson.title,
                  section.title,
                  course.title,
                ].filter(Boolean);

                if (lessonKeywords.length > 0) {
                  courseDocs.push(
                    `Từ khóa bài học: ${lessonKeywords.join(', ')}
Liên quan đến: ${lesson.title} (${section.title} - ${course.title})`,
                  );
                }
              });
            }
          });
        }
      });
      documentsToAdd.push(...courseDocs);
      this.logger.log(`Added ${courseDocs.length} course documents`);

      // Add academic classes
      const classDocs: string[] = [];
      academicClasses.forEach((academicClass) => {
        // Document chính cho lớp học
        const classMainDoc = `Lớp học: ${academicClass.className}
Mã lớp: ${academicClass.classCode}
Học kỳ: ${academicClass.semester}
Trạng thái: ${academicClass.status}
Ngành: ${academicClass.major?.majorName || 'Không có'}
Chương trình: ${academicClass.program?.programName || 'Không có'}`;

        // Thêm thông tin giảng viên
        let instructorsInfo = '';
        if (academicClass.instructors && academicClass.instructors.length > 0) {
          instructorsInfo = `\nGiảng viên (${academicClass.instructors.length} người):`;
          academicClass.instructors.forEach((classInstructor, index) => {
            instructorsInfo += `\n- ${classInstructor.instructor?.user?.username || 'Không có'}`;
            if (classInstructor.instructor?.fullName) {
              instructorsInfo += ` (${classInstructor.instructor.fullName})`;
            }
            if (classInstructor.instructor?.professionalTitle) {
              instructorsInfo += ` - ${classInstructor.instructor.professionalTitle}`;
            }
          });
        }

        // Thêm thông tin học viên
        let studentsInfo = '';
        if (
          academicClass.studentsAcademic &&
          academicClass.studentsAcademic.length > 0
        ) {
          studentsInfo = `\nHọc viên (${academicClass.studentsAcademic.length} người):`;
          academicClass.studentsAcademic.forEach((student, index) => {
            studentsInfo += `\n- ${student.user?.username || 'Không có'}`;
            if (student.fullName) {
              studentsInfo += ` (${student.fullName})`;
            }
          });
        }

        // Thêm thông tin khóa học
        let coursesInfo = '';
        if (
          academicClass.classCourses &&
          academicClass.classCourses.length > 0
        ) {
          coursesInfo = `\nKhóa học (${academicClass.classCourses.length} khóa):`;
          academicClass.classCourses.forEach((classCourse, index) => {
            coursesInfo += `\n- ${classCourse.course?.title || 'Không có'}`;
          });
        }

        classDocs.push(
          classMainDoc + instructorsInfo + studentsInfo + coursesInfo,
        );

        // Tạo document từ khóa cho lớp học
        const classKeywords = [
          academicClass.className,
          academicClass.className?.toLowerCase(),
          academicClass.classCode,
          'lớp học ' + academicClass.className,
          academicClass.major?.majorName,
          academicClass.program?.programName,
          academicClass.semester,
        ].filter(Boolean);

        if (classKeywords.length > 0) {
          classDocs.push(
            `Từ khóa lớp học: ${classKeywords.join(', ')}
Liên quan đến: ${academicClass.className}`,
          );
        }
      });
      documentsToAdd.push(...classDocs);
      this.logger.log(`Added ${classDocs.length} academic class documents`);

      // Add instructors
      const instructorDocs: string[] = [];
      instructors.forEach((instructor) => {
        // Document chính cho giảng viên
        const instructorMainDoc = `Giảng viên: ${instructor.user.username}
Email: ${instructor.user.email}
Số điện thoại: ${instructor.user.phone || 'Chưa cập nhật'}
Họ tên: ${instructor.fullName}
Chức danh: ${instructor.professionalTitle || 'Chưa cập nhật'}
Chuyên môn: ${instructor.specialization || 'Chưa cập nhật'}
Khoa: ${instructor.faculty?.facultyName || 'Chưa cập nhật'}`;

        // Thêm thông tin courses
        let coursesInfo = '';
        if (instructor.courses && instructor.courses.length > 0) {
          coursesInfo = `\nKhóa học (${instructor.courses.length} khóa):`;
          instructor.courses.forEach((course, index) => {
            coursesInfo += `\n- ${course.title}`;
            if (course.category?.name) {
              coursesInfo += ` (${course.category.name})`;
            }
          });
        }

        // Thêm thông tin documents
        let documentsInfo = '';
        if (instructor.documents && instructor.documents.length > 0) {
          documentsInfo = `\nTài liệu (${instructor.documents.length} tài liệu):`;
          instructor.documents.forEach((doc, index) => {
            documentsInfo += `\n- ${doc.title}`;
            if (doc.fileType) {
              documentsInfo += ` [${doc.fileType}]`;
            }
          });
        }

        instructorDocs.push(instructorMainDoc + coursesInfo + documentsInfo);

        // Tạo document từ khóa cho giảng viên
        const instructorKeywords = [
          instructor.user.username,
          instructor.user.username?.toLowerCase(),
          instructor.fullName,
          instructor.fullName?.toLowerCase(),
          'giảng viên ' + instructor.user.username,
          'giảng viên ' + instructor.fullName,
          instructor.professionalTitle,
          instructor.specialization,
          instructor.faculty?.facultyName,
        ].filter(Boolean);

        if (instructorKeywords.length > 0) {
          instructorDocs.push(
            `Từ khóa giảng viên: ${instructorKeywords.join(', ')}
Liên quan đến: ${instructor.fullName}`,
          );
        }
      });
      documentsToAdd.push(...instructorDocs);
      this.logger.log(`Added ${instructorDocs.length} instructor documents`);

      // Add documents
      const docDocs: string[] = [];
      documents.forEach((doc) => {
        // Document chính cho tài liệu
        const docMainDoc = `Tài liệu: ${doc.title}
Mô tả: ${doc.description || 'Không có mô tả'}
Loại file: ${doc.fileType || 'Không xác định'}
Upload bởi: ${doc.instructor?.user?.username || 'Không có'}
Thuộc phần: ${doc.courseSection?.title || 'Không có'}
Thuộc khóa học: ${doc.courseSection?.course?.title || 'Không có'}`;

        docDocs.push(docMainDoc);

        // Document riêng cho từ khóa
        const keywords = [
          doc.title,
          doc.title?.toLowerCase(),
          'tài liệu ' + doc.title,
          doc.instructor?.user?.username,
          doc.instructor?.fullName,
          doc.courseSection?.title,
          doc.courseSection?.course?.title,
        ].filter(Boolean);

        if (keywords.length > 0) {
          docDocs.push(
            `Từ khóa tài liệu: ${keywords.join(', ')}
Liên quan đến: ${doc.title}`,
          );
        }
      });
      documentsToAdd.push(...docDocs);
      this.logger.log(`Added ${docDocs.length} document files`);

      // Add forums
      const forumDocs: string[] = [];
      forums.forEach((forum) => {
        // Document chính cho diễn đàn
        const forumMainDoc = `Diễn đàn: ${forum.title}
Mô tả: ${forum.description || 'Không có mô tả'}
Trạng thái: ${forum.status}
Tạo bởi: ${forum.user?.username || 'Không có'}
Thuộc khóa học: ${forum.course?.title || 'Không có'}`;

        forumDocs.push(forumMainDoc);

        // Document riêng cho từ khóa
        const keywords = [
          forum.title,
          forum.title?.toLowerCase(),
          'diễn đàn ' + forum.title,
          forum.user?.username,
          forum.course?.title,
        ].filter(Boolean);

        if (keywords.length > 0) {
          forumDocs.push(
            `Từ khóa diễn đàn: ${keywords.join(', ')}
Liên quan đến: ${forum.title}`,
          );
        }
      });
      documentsToAdd.push(...forumDocs);
      this.logger.log(`Added ${forumDocs.length} forum documents`);

      // Add categories
      const categoryDocs: string[] = [];
      categories.forEach((category) => {
        // Document chính cho danh mục
        categoryDocs.push(
          `Danh mục: ${category.name}
Mô tả: ${category.description || 'Không có mô tả'}`,
        );

        // Document riêng cho từ khóa
        const keywords = [
          category.name,
          category.name?.toLowerCase(),
          'danh mục ' + category.name,
        ].filter(Boolean);

        if (keywords.length > 0) {
          categoryDocs.push(
            `Từ khóa danh mục: ${keywords.join(', ')}
Liên quan đến: ${category.name}`,
          );
        }
      });
      documentsToAdd.push(...categoryDocs);
      this.logger.log(`Added ${categoryDocs.length} category documents`);

      // Add quizzes
      const quizDocs: string[] = [];
      quizzes.forEach((quiz) => {
        // Document chính cho bài kiểm tra
        quizDocs.push(
          `Bài kiểm tra: ${quiz.title}
Mô tả: ${quiz.description || 'Không có mô tả'}
Loại bài kiểm tra: ${quiz.quizType}
Thời gian làm bài: ${quiz.timeLimit || 'Không giới hạn'} phút
Điểm đạt: ${quiz.passingScore || 'Chưa xác định'}
Số lần làm lại: ${quiz.attemptsAllowed}
Bài học: ${quiz.lesson?.title || 'Không có'}
Lớp: ${quiz.academicClass?.className || 'Không có'}`,
        );

        // Document riêng cho từ khóa
        const keywords = [
          quiz.title,
          quiz.title?.toLowerCase(),
          'bài kiểm tra ' + quiz.title,
          quiz.quizType,
        ].filter(Boolean);

        if (keywords.length > 0) {
          quizDocs.push(
            `Từ khóa bài kiểm tra: ${keywords.join(', ')}
Liên quan đến: ${quiz.title}`,
          );
        }
      });
      documentsToAdd.push(...quizDocs);
      this.logger.log(`Added ${quizDocs.length} quiz documents`);

      // Add assignments
      const assignmentDocs: string[] = [];
      assignments.forEach((assignment) => {
        // Document chính cho bài tập
        assignmentDocs.push(
          `Bài tập: ${assignment.title}
Mô tả: ${assignment.description || 'Không có mô tả'}
Loại bài tập: ${assignment.assignmentType}
Hạn nộp: ${assignment.dueDate || 'Chưa xác định'}
Điểm tối đa: ${assignment.maxScore || 'Chưa xác định'}
Yêu cầu file: ${assignment.fileRequirements || 'Không có'}
Bài học: ${assignment.lesson?.title || 'Không có'}
Lớp: ${assignment.academicClass?.className || 'Không có'}`,
        );

        // Document riêng cho từ khóa
        const keywords = [
          assignment.title,
          assignment.title?.toLowerCase(),
          'bài tập ' + assignment.title,
          assignment.assignmentType,
        ].filter(Boolean);

        if (keywords.length > 0) {
          assignmentDocs.push(
            `Từ khóa bài tập: ${keywords.join(', ')}
Liên quan đến: ${assignment.title}`,
          );
        }
      });
      documentsToAdd.push(...assignmentDocs);
      this.logger.log(`Added ${assignmentDocs.length} assignment documents`);

      // Add users
      const userDocs: string[] = [];
      users.forEach((user) => {
        // Document chính cho người dùng
        userDocs.push(
          `Người dùng: ${user.username}
Email: ${user.email}
Số điện thoại: ${user.phone || 'Chưa cập nhật'}
Vai trò: ${user.role}`,
        );

        // Document riêng cho từ khóa
        const keywords = [
          user.username,
          user.username?.toLowerCase(),
          'người dùng ' + user.username,
          user.role,
        ].filter(Boolean);

        if (keywords.length > 0) {
          userDocs.push(
            `Từ khóa người dùng: ${keywords.join(', ')}
Liên quan đến: ${user.username}`,
          );
        }
      });
      documentsToAdd.push(...userDocs);
      this.logger.log(`Added ${userDocs.length} user documents`);

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
        const reviewMainDoc = `Đánh giá: ${review.rating} sao
Nội dung: ${review.reviewText || 'Không có nội dung'}
Loại đánh giá: ${review.reviewType}
Đánh giá bởi: ${review.student?.user?.username || 'Không có'}
Thuộc khóa học: ${review.course?.title || 'Không có'}`;

        const keywords = [
          String(review.rating) + ' sao',
          review.reviewText,
          'đánh giá',
          review.student?.user?.username,
          review.course?.title,
        ]
          .filter(Boolean)
          .join(', ');

        reviewDocs.push(
          `${reviewMainDoc}
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

      // Add faculties
      const facultyDocs: string[] = [];
      faculties.forEach((faculty) => {
        // Document chính cho khoa
        const facultyMainDoc = `Khoa: ${faculty.facultyName}
Mã khoa: ${faculty.facultyCode}
Mô tả: ${faculty.description || 'Không có mô tả'}
Trạng thái: ${faculty.status}`;

        // Thêm thông tin ngành
        let majorsInfo = '';
        if (faculty.majors && faculty.majors.length > 0) {
          majorsInfo = `\nNgành (${faculty.majors.length} ngành):`;
          faculty.majors.forEach((major, index) => {
            majorsInfo += `\n- ${major.majorName} (${major.majorCode})`;
            if (major.description) {
              majorsInfo += ` - ${major.description}`;
            }
          });
        }

        // Thêm thông tin giảng viên
        let instructorsInfo = '';
        if (faculty.userInstructors && faculty.userInstructors.length > 0) {
          instructorsInfo = `\nGiảng viên (${faculty.userInstructors.length} người):`;
          faculty.userInstructors.forEach((instructor, index) => {
            instructorsInfo += `\n- ${instructor.user?.username || 'Không có'}`;
            if (instructor.fullName) {
              instructorsInfo += ` (${instructor.fullName})`;
            }
          });
        }

        facultyDocs.push(facultyMainDoc + majorsInfo + instructorsInfo);

        // Tạo document từ khóa cho khoa
        const facultyKeywords = [
          faculty.facultyName,
          faculty.facultyName?.toLowerCase(),
          faculty.facultyCode,
          'khoa ' + faculty.facultyName,
          'faculty ' + faculty.facultyName,
        ].filter(Boolean);

        if (facultyKeywords.length > 0) {
          facultyDocs.push(
            `Từ khóa khoa: ${facultyKeywords.join(', ')}
Liên quan đến: ${faculty.facultyName}`,
          );
        }
      });
      documentsToAdd.push(...facultyDocs);
      this.logger.log(`Added ${facultyDocs.length} faculty documents`);

      // Add majors
      const majorDocs: string[] = [];
      majors.forEach((major) => {
        // Document chính cho ngành
        const majorMainDoc = `Ngành: ${major.majorName}
Mã ngành: ${major.majorCode}
Mô tả: ${major.description || 'Không có mô tả'}
Trạng thái: ${major.status}
Thuộc khoa: ${major.faculty?.facultyName || 'Không có'}`;

        // Thêm thông tin chương trình
        let programsInfo = '';
        if (major.programs && major.programs.length > 0) {
          programsInfo = `\nChương trình (${major.programs.length} chương trình):`;
          major.programs.forEach((program, index) => {
            programsInfo += `\n- ${program.programName} (${program.programCode})`;
            if (program.description) {
              programsInfo += ` - ${program.description}`;
            }
            programsInfo += ` - ${program.totalCredits} tín chỉ, ${program.durationYears} năm`;
          });
        }

        // Thêm thông tin lớp học
        let classesInfo = '';
        if (major.academicClasses && major.academicClasses.length > 0) {
          classesInfo = `\nLớp học (${major.academicClasses.length} lớp):`;
          major.academicClasses.forEach((academicClass, index) => {
            classesInfo += `\n- ${academicClass.className} (${academicClass.classCode})`;
            classesInfo += ` - Học kỳ: ${academicClass.semester}`;
          });
        }

        majorDocs.push(majorMainDoc + programsInfo + classesInfo);

        // Tạo document từ khóa cho ngành
        const majorKeywords = [
          major.majorName,
          major.majorName?.toLowerCase(),
          major.majorCode,
          'ngành ' + major.majorName,
          'major ' + major.majorName,
          major.faculty?.facultyName,
        ].filter(Boolean);

        if (majorKeywords.length > 0) {
          majorDocs.push(
            `Từ khóa ngành: ${majorKeywords.join(', ')}
Liên quan đến: ${major.majorName}`,
          );
        }
      });
      documentsToAdd.push(...majorDocs);
      this.logger.log(`Added ${majorDocs.length} major documents`);

      // Add programs
      const programDocs: string[] = [];
      programs.forEach((program) => {
        // Document chính cho chương trình
        const programMainDoc = `Chương trình: ${program.programName}
Mã chương trình: ${program.programCode}
Mô tả: ${program.description || 'Không có mô tả'}
Tổng tín chỉ: ${program.totalCredits}
Thời gian đào tạo: ${program.durationYears} năm
Trạng thái: ${program.status}
Thuộc ngành: ${program.major?.majorName || 'Không có'}
Thuộc khoa: ${program.major?.faculty?.facultyName || 'Không có'}`;

        // Thêm thông tin khóa học
        let coursesInfo = '';
        if (program.programCourses && program.programCourses.length > 0) {
          coursesInfo = `\nKhóa học (${program.programCourses.length} khóa):`;
          program.programCourses.forEach((programCourse, index) => {
            coursesInfo += `\n- ${programCourse.course?.title || 'Không có'}`;
            coursesInfo += ` - ${programCourse.credits} tín chỉ`;
            coursesInfo += ` - Học kỳ: ${programCourse.semester}`;
            coursesInfo += ` - Bắt buộc: ${programCourse.isMandatory ? 'Có' : 'Không'}`;
          });
        }

        // Thêm thông tin lớp học
        let classesInfo = '';
        if (program.academicClasses && program.academicClasses.length > 0) {
          classesInfo = `\nLớp học (${program.academicClasses.length} lớp):`;
          program.academicClasses.forEach((academicClass, index) => {
            classesInfo += `\n- ${academicClass.className} (${academicClass.classCode})`;
            classesInfo += ` - Học kỳ: ${academicClass.semester}`;
          });
        }

        programDocs.push(programMainDoc + coursesInfo + classesInfo);

        // Tạo document từ khóa cho chương trình
        const programKeywords = [
          program.programName,
          program.programName?.toLowerCase(),
          program.programCode,
          'chương trình ' + program.programName,
          'program ' + program.programName,
          program.major?.majorName,
          program.major?.faculty?.facultyName,
        ].filter(Boolean);

        if (programKeywords.length > 0) {
          programDocs.push(
            `Từ khóa chương trình: ${programKeywords.join(', ')}
Liên quan đến: ${program.programName}`,
          );
        }
      });
      documentsToAdd.push(...programDocs);
      this.logger.log(`Added ${programDocs.length} program documents`);

      // Add program courses
      const programCourseDocs: string[] = [];
      programCourses.forEach((programCourse) => {
        // Document chính cho khóa học trong chương trình
        const programCourseMainDoc = `Khóa học trong chương trình: ${programCourse.course?.title || 'Không có'}
Thuộc chương trình: ${programCourse.program?.programName || 'Không có'}
Số tín chỉ: ${programCourse.credits}
Học kỳ: ${programCourse.semester}
Số tiết lý thuyết: ${programCourse.theory}
Số tiết thực hành: ${programCourse.practice}
Bắt buộc: ${programCourse.isMandatory ? 'Có' : 'Không'}
Thời gian bắt đầu: ${programCourse.start_time}
Thời gian kết thúc: ${programCourse.end_time}`;

        programCourseDocs.push(programCourseMainDoc);

        // Tạo document từ khóa cho khóa học trong chương trình
        const programCourseKeywords = [
          programCourse.course?.title,
          programCourse.course?.title?.toLowerCase(),
          programCourse.program?.programName,
          programCourse.program?.programCode,
          'khóa học ' + programCourse.course?.title,
          'course ' + programCourse.course?.title,
          String(programCourse.credits) + ' tín chỉ',
          'học kỳ ' + programCourse.semester,
        ].filter(Boolean);

        if (programCourseKeywords.length > 0) {
          programCourseDocs.push(
            `Từ khóa khóa học chương trình: ${programCourseKeywords.join(', ')}
Liên quan đến: ${programCourse.course?.title} (${programCourse.program?.programName})`,
          );
        }
      });
      documentsToAdd.push(...programCourseDocs);
      this.logger.log(
        `Added ${programCourseDocs.length} program course documents`,
      );

      this.logger.log(
        `Tìm thấy tổng cộng ${documentsToAdd.length} tài liệu để thêm vào`,
      );
      this.logger.log(`Bắt đầu nhập tài liệu vào RAG...`);

      // Add to RAG in smaller chunks
      try {
        await this.ragService.addDocuments(documentsToAdd);
        this.logger.log('Nhập tất cả dữ liệu cơ sở dữ liệu vào RAG thành công');
      } catch (error) {
        this.logger.error('Lỗi khi nhập tài liệu vào RAG:', error);
        if (error.data?.status?.error) {
          this.logger.error(`Chi tiết lỗi: ${error.data.status.error}`);
        }
        throw error;
      }
    } catch (error) {
      this.logger.error('Lỗi khi nhập dữ liệu cơ sở dữ liệu:', error);
      throw error;
    }
  }
}
