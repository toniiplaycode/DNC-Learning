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

      // Thêm các tài liệu hướng dẫn thao tác cơ bản (FAQ)
      const faqDocs = [
        `Hướng dẫn đăng ký khóa học:
1. Đăng nhập vào hệ thống DNC Learning Platform.
2. Vào mục "Khóa học" và chọn khóa học bạn muốn đăng ký.
3. Nhấn nút "Đăng ký" hoặc "Ghi danh" trên trang chi tiết khóa học.
4. Xác nhận thông tin và hoàn tất đăng ký.`,
        `Cách tham gia lớp học:
- Liên hệ giảng viên, bạn sẽ được thêm vào lớp học tương ứng.
- Truy cập mục "Lớp học của tôi" để xem danh sách lớp học đã tham gia.
- Nhấn vào tên lớp để vào phòng học trực tuyến, xem tài liệu, bài giảng và trao đổi với giảng viên.`,
        `Cách nộp bài tập:
1. Vào lớp học hoặc khóa học có bài tập cần nộp.
2. Chọn mục "Bài tập" hoặc "Assignments".
3. Nhấn vào bài tập cần nộp, đọc kỹ yêu cầu.
4. Tải lên file hoặc nhập nội dung, sau đó nhấn "Nộp bài".`,
        `Cách tham gia diễn đàn:
- Vào mục "Diễn đàn" trong lớp học hoặc khóa học.
- Chọn chủ đề thảo luận hoặc tạo chủ đề mới.
- Viết nội dung và nhấn "Gửi" để tham gia trao đổi với các thành viên khác.`,
        `Cách xem điểm và nhận xét:
- Vào mục "Kết quả học tập" hoặc "Grades" trong lớp học.
- Xem điểm số, nhận xét từ giảng viên và tiến độ hoàn thành các bài tập, kiểm tra.`,
        `Tôi quên mật khẩu, phải làm sao?
- Nhấn vào "Quên mật khẩu" trên trang đăng nhập, nhập email đã đăng ký để nhận hướng dẫn đặt lại mật khẩu.`,
        `Làm sao để thay đổi thông tin cá nhân?
- Đăng nhập vào hệ thống, vào mục "Tài khoản" hoặc "Thông tin cá nhân" để chỉnh sửa tên, email, mật khẩu, ảnh đại diện...`,
        `Tôi gặp lỗi khi truy cập bài học hoặc tài liệu?
- Hãy thử tải lại trang, kiểm tra kết nối mạng. Nếu vẫn lỗi, liên hệ bộ phận hỗ trợ hoặc giảng viên để được trợ giúp.`,
        `Làm sao để liên hệ hỗ trợ kỹ thuật?
- Sử dụng mục "Liên hệ" hoặc "Hỗ trợ" trên hệ thống, hoặc gửi email tới bộ phận kỹ thuật được ghi trên trang chủ.`,
        `Tôi không thấy khóa học đã đăng ký trong danh sách?
- Kiểm tra lại tài khoản đăng nhập đúng chưa. Nếu vẫn không thấy, liên hệ giảng viên hoặc quản trị viên để được kiểm tra.`,
        `Cách sử dụng chatbot hỗ trợ?
- Nhấn vào biểu tượng chatbot ở góc màn hình, nhập câu hỏi hoặc vấn đề bạn gặp phải. Chatbot sẽ trả lời hoặc hướng dẫn bạn thao tác.`,
        `Tôi có thể học trên điện thoại không?
- Hệ thống DNC Learning hỗ trợ truy cập trên cả máy tính và điện thoại thông minh qua trình duyệt web.`,
        `Làm sao để biết lịch học, lịch kiểm tra?
- Vào mục "Lịch học" hoặc "Lịch thi" trong lớp học hoặc khóa học để xem chi tiết lịch trình.`,
        `Tôi có thể gửi phản hồi về hệ thống ở đâu?
- Sử dụng mục "Góp ý" hoặc "Phản hồi" trên hệ thống để gửi ý kiến, đánh giá hoặc báo lỗi cho quản trị viên.`,
        `Làm sao để xem điểm số và nhận xét của giảng viên?
- Vào mục "Kết quả học tập" hoặc "Grades" để xem điểm và nhận xét cho từng bài tập, kiểm tra.`,
        `Tôi có thể tải tài liệu học tập về máy không?
- Nếu tài liệu cho phép tải, bạn sẽ thấy nút "Tải về" bên cạnh tài liệu. Nhấn để tải file về máy.`,
        `Làm sao để biết mình đã hoàn thành khóa học chưa?
- Vào trang chi tiết khóa học, kiểm tra tiến độ hoàn thành và các mục đã hoàn thành.`,
        `Tôi có được cấp chứng chỉ sau khi hoàn thành khóa học không?
- Nếu khóa học có cấp chứng chỉ, bạn sẽ nhận được chứng chỉ điện tử sau khi hoàn thành đủ điều kiện.`,
        `Có thể học lại bài giảng đã xem không?
- Bạn có thể xem lại các bài giảng, tài liệu bất cứ lúc nào trong thời gian còn hiệu lực khóa học.`,
        `Tôi có thể đặt câu hỏi cho giảng viên ở đâu?
- Sử dụng mục "Diễn đàn" hoặc "Hỏi đáp" trong lớp học để đặt câu hỏi cho giảng viên và các bạn học khác.`,
        `Làm sao để biết thông báo mới từ hệ thống?
- Xem mục "Thông báo" trên thanh menu hoặc kiểm tra email đã đăng ký để nhận thông báo mới.`,
        `Tôi có thể thay đổi mật khẩu như thế nào?
- Vào mục "Tài khoản" > "Đổi mật khẩu", nhập mật khẩu cũ và mật khẩu mới để thay đổi.`,
        `Nếu bị mất kết nối khi làm bài kiểm tra thì sao?
- Hệ thống sẽ tự động lưu lại tiến trình, bạn có thể đăng nhập lại và tiếp tục nếu bài kiểm tra còn thời gian.`,
        `Có thể đăng ký nhiều khóa học cùng lúc không?
- Bạn có thể đăng ký nhiều khóa học khác nhau tùy theo nhu cầu và điều kiện của từng khóa học.`,
        `Tôi có thể xem lại lịch sử hoạt động của mình không?
- Vào mục "Lịch sử hoạt động" hoặc "Hoạt động gần đây" để xem các thao tác, bài nộp, điểm số... của bạn.`,
        `Làm sao để cập nhật ảnh đại diện?
- Vào mục "Tài khoản" hoặc "Thông tin cá nhân", chọn "Cập nhật ảnh đại diện" và tải lên ảnh mới.`,
        `Tôi có thể liên hệ với bạn học khác không?
- Sử dụng chức năng nhắn tin hoặc diễn đàn trong lớp học để trao đổi với các bạn học khác.`,
        `Tôi có thể đổi email đăng nhập không?
- Vào mục "Tài khoản", chọn "Thay đổi email" và làm theo hướng dẫn.`,
        `Có thể sử dụng tài khoản Google/Facebook để đăng nhập không?
- Nếu hệ thống hỗ trợ, bạn sẽ thấy nút đăng nhập bằng Google/Facebook trên trang đăng nhập.`,
        `Tôi có thể xem video bài giảng ở tốc độ nhanh/chậm không?
- Nếu trình phát video hỗ trợ, bạn có thể điều chỉnh tốc độ phát ngay trên giao diện xem bài giảng.`,
        `Làm sao để biết bài tập nào chưa nộp?
- Vào mục "Bài tập" trong lớp học để xem danh sách bài tập và trạng thái đã nộp/chưa nộp.`,
        `Tôi có thể xem lại bài kiểm tra đã làm không?
- Một số bài kiểm tra cho phép xem lại đáp án và kết quả sau khi nộp, tùy theo cài đặt của giảng viên.`,
        `Có thể đổi ngôn ngữ giao diện hệ thống không?
- Nếu hệ thống hỗ trợ đa ngôn ngữ, bạn có thể chọn ngôn ngữ ở góc trên hoặc trong mục "Cài đặt".`,
        `Tôi có thể đăng ký làm trợ giảng không?
- Liên hệ giảng viên hoặc quản trị viên để biết điều kiện và quy trình đăng ký làm trợ giảng.`,
        `Làm sao để biết thời hạn truy cập khóa học?
- Xem thông tin thời hạn trên trang chi tiết khóa học hoặc hỏi giảng viên.`,
        `Tôi có thể yêu cầu hoàn tiền học phí không?
- Liên hệ bộ phận tài chính hoặc quản trị viên để biết chính sách hoàn tiền của hệ thống.`,
        `Có thể sử dụng hệ thống trên nhiều thiết bị không?
- Bạn có thể đăng nhập và học trên nhiều thiết bị khác nhau, nhưng không nên chia sẻ tài khoản cho người khác.`,
        `Tôi có thể lưu bài giảng để học offline không?
- Nếu hệ thống hỗ trợ, bạn sẽ thấy tùy chọn tải về hoặc lưu offline cho từng bài giảng.`,
        `Làm sao để biết điểm trung bình của mình?
- Vào mục "Kết quả học tập" để xem điểm trung bình các môn đã học.`,
        `Tôi có thể đổi tên hiển thị không?
- Vào mục "Thông tin cá nhân" để chỉnh sửa tên hiển thị.`,
        `Có thể ẩn thông tin cá nhân với người khác không?
- Một số thông tin có thể được ẩn trong phần cài đặt quyền riêng tư.`,
        `Tôi có thể gửi file lớn qua hệ thống không?
- Hệ thống có giới hạn dung lượng file tải lên, kiểm tra thông báo khi upload file.`,
        `Làm sao để biết ai là giảng viên phụ trách lớp?
- Xem thông tin giảng viên trên trang chi tiết lớp học hoặc khóa học.`,
        `Tôi có thể xem lịch sử chat với chatbot không?
- Một số hệ thống lưu lại lịch sử chat, bạn có thể xem lại trong mục "Chatbot" hoặc "Hỗ trợ".`,
        `Có thể thay đổi vai trò tài khoản (học viên/giảng viên) không?
- Liên hệ quản trị viên để được hỗ trợ thay đổi vai trò nếu cần thiết.`,
        `Tôi có thể đăng ký nhận thông báo qua email không?
- Vào mục "Cài đặt thông báo" để bật/tắt nhận thông báo qua email.`,
        `Làm sao để biết tiến độ học tập của mình?
- Xem mục "Tiến độ học tập" trong từng khóa học hoặc lớp học.`,
        `Tôi có thể yêu cầu cấp lại chứng chỉ không?
- Liên hệ quản trị viên hoặc bộ phận đào tạo để được cấp lại chứng chỉ nếu đủ điều kiện.`,
        `Có thể sử dụng hệ thống bằng trình duyệt nào?
- Hệ thống hỗ trợ tốt nhất trên Chrome, Firefox, Edge, Safari bản mới nhất.`,
        `Tôi có thể đổi số điện thoại liên kết không?
- Vào mục "Thông tin cá nhân" để thay đổi số điện thoại.`,
        `Làm sao để biết các quyền lợi khi tham gia khóa học?
- Xem mục "Quyền lợi học viên" trên trang chi tiết khóa học hoặc hỏi giảng viên.`,
        `Tôi có thể đăng ký học thử miễn phí không?
- Một số khóa học có hỗ trợ học thử, kiểm tra thông tin trên trang khóa học.`,
        `Có thể chia sẻ tài liệu cho bạn học khác không?
- Nếu tài liệu cho phép chia sẻ, bạn sẽ thấy nút "Chia sẻ" hoặc "Gửi cho bạn học".`,
        `Tôi có thể đặt lịch học cá nhân không?
- Sử dụng chức năng "Lịch cá nhân" hoặc "Đặt lịch" nếu hệ thống hỗ trợ.`,
        `Làm sao để biết hệ thống có bảo mật thông tin không?
- Hệ thống tuân thủ các quy định bảo mật, bạn có thể xem chính sách bảo mật trên trang chủ.`,
        `Tôi có thể yêu cầu hỗ trợ ngoài giờ hành chính không?
- Gửi yêu cầu qua mục "Hỗ trợ" hoặc email, bộ phận kỹ thuật sẽ phản hồi sớm nhất có thể.`,
        `Có thể sử dụng tài khoản cho nhiều mục đích (học, thi, trao đổi) không?
- Tài khoản học viên có thể dùng cho tất cả các chức năng học tập, thi cử, trao đổi trên hệ thống.`,
        `Tôi có thể kiểm tra trạng thái nộp bài tập không?
- Vào mục "Bài tập" để xem trạng thái đã nộp, chấm điểm, nhận xét...`,
        `Làm sao để biết hệ thống có cập nhật mới không?
- Xem mục "Tin tức" hoặc "Thông báo" để biết các cập nhật, tính năng mới.`,
        `Tôi có thể gửi câu hỏi ẩn danh cho giảng viên không?
- Nếu hệ thống hỗ trợ, bạn sẽ thấy tùy chọn gửi ẩn danh khi đặt câu hỏi.`,
        `Có thể sử dụng hệ thống cho đào tạo doanh nghiệp không?
- Hệ thống hỗ trợ đào tạo cá nhân và doanh nghiệp, liên hệ quản trị viên để biết thêm chi tiết.`,
        `Tôi có thể đăng ký nhận bản tin hệ thống không?
- Vào mục "Cài đặt thông báo" để đăng ký nhận bản tin, tin tức mới qua email.`,
        `Làm sao để biết hệ thống có hỗ trợ người khuyết tật không?
- Xem mục "Hỗ trợ đặc biệt" hoặc liên hệ quản trị viên để biết các chính sách hỗ trợ.`,
        `Làm sao để biết thời hạn nộp bài tập?
- Xem chi tiết từng bài tập, hệ thống sẽ hiển thị hạn nộp rõ ràng cho mỗi bài.`,
        `Tôi có thể xin gia hạn nộp bài tập không?
- Liên hệ trực tiếp giảng viên để xin gia hạn, tùy vào chính sách của từng lớp học.`,
        `Có thể xem điểm chi tiết từng phần trong bài kiểm tra không?
- Nếu giảng viên cho phép, bạn sẽ thấy điểm từng phần sau khi chấm xong.`,
        `Tôi có thể xem lại các thông báo cũ không?
- Vào mục "Thông báo" để xem lại toàn bộ thông báo đã nhận.`,
        `Làm sao để biết mình đã đọc hết tài liệu chưa?
- Hệ thống sẽ đánh dấu tài liệu đã đọc hoặc bạn có thể kiểm tra trạng thái trên giao diện.`,
        `Có thể chuyển lớp học nếu đăng ký nhầm không?
- Liên hệ quản trị viên hoặc giảng viên để được hỗ trợ chuyển lớp nếu đủ điều kiện.`,
        `Tôi có thể bảo lưu kết quả học tập không?
- Một số chương trình cho phép bảo lưu, liên hệ phòng đào tạo để biết chi tiết.`,
        `Có thể chuyển đổi giữa các chương trình học không?
- Liên hệ phòng đào tạo để được tư vấn về chuyển đổi chương trình học.`,
        `Tôi có thể xem lịch sử chỉnh sửa bài nộp không?
- Nếu hệ thống hỗ trợ, bạn sẽ thấy lịch sử các lần nộp/chỉnh sửa bài tập.`,
        `Có thể gửi bài tập nhóm qua hệ thống không?
- Nếu bài tập là nhóm, hệ thống sẽ cho phép chọn thành viên và nộp bài tập nhóm.`,
        `Làm sao để biết ai đã xem bài đăng của mình trên diễn đàn?
- Một số diễn đàn hiển thị số lượt xem hoặc danh sách người đã xem bài đăng.`,
        `Tôi có thể xóa bài nộp đã gửi không?
- Tùy vào cài đặt của giảng viên, bạn có thể xóa hoặc thay thế bài nộp trước hạn.`,
        `Có thể đổi lớp học sau khi đã bắt đầu không?
- Liên hệ giảng viên hoặc quản trị viên để được hỗ trợ đổi lớp nếu có lý do chính đáng.`,
        `Tôi có thể xem tổng hợp tiến độ học tập của tất cả các khóa không?
- Vào mục "Tổng quan học tập" hoặc "Dashboard" để xem tiến độ tổng hợp.`,
        `Có thể đăng ký học phần tự chọn qua hệ thống không?
- Nếu chương trình hỗ trợ, bạn sẽ thấy mục đăng ký học phần tự chọn trong tài khoản.`,
        `Tôi có thể xem lại các bài giảng trực tiếp (livestream) không?
- Nếu giảng viên ghi hình, bạn sẽ thấy video lưu lại trong mục bài giảng.`,
        `Có thể gửi bài tập qua email thay vì hệ thống không?
- Nên nộp bài qua hệ thống để đảm bảo lưu vết và chấm điểm tự động.`,
        `Tôi có thể kiểm tra trạng thái thanh toán học phí không?
- Vào mục "Tài chính" hoặc "Thanh toán" để xem trạng thái học phí, hóa đơn.`,
        `Có thể nhận thông báo qua SMS không?
- Nếu hệ thống hỗ trợ, bạn có thể đăng ký nhận thông báo qua SMS trong cài đặt.`,
        `Tôi có thể xem lại các câu hỏi đã gửi cho giảng viên không?
- Vào mục "Hỏi đáp" hoặc "Lịch sử hỏi đáp" để xem lại các câu hỏi đã gửi.`,
        `Có thể sử dụng tài khoản phụ huynh để theo dõi tiến độ học của con không?
- Một số hệ thống hỗ trợ tài khoản phụ huynh, liên hệ quản trị viên để biết thêm.`,
        `Tôi có thể yêu cầu cấp bảng điểm không?
- Liên hệ phòng đào tạo hoặc quản trị viên để được cấp bảng điểm điện tử.`,
        `Có thể đăng ký học lại môn đã trượt không?
- Bạn có thể đăng ký học lại nếu chương trình cho phép, kiểm tra với phòng đào tạo.`,
        `Tôi có thể xem lịch sử đăng nhập của mình không?
- Vào mục "Bảo mật" hoặc "Lịch sử đăng nhập" để xem các lần đăng nhập gần đây.`,
        `Có thể đổi mật khẩu định kỳ không?
- Bạn nên đổi mật khẩu định kỳ để bảo mật tài khoản, thao tác trong mục "Đổi mật khẩu".`,
        `Tôi có thể sử dụng hệ thống khi đang ở nước ngoài không?
- Hệ thống hỗ trợ truy cập toàn cầu qua internet.`,
        `Có thể đăng ký nhận tài liệu học tập qua email không?
- Nếu hệ thống hỗ trợ, bạn có thể đăng ký nhận tài liệu mới qua email.`,
        `Tôi có thể kiểm tra trạng thái xét tốt nghiệp không?
- Vào mục "Xét tốt nghiệp" hoặc liên hệ phòng đào tạo để biết trạng thái.`,
        `Có thể gửi phản hồi về chất lượng giảng viên không?
- Sử dụng mục "Góp ý" hoặc "Đánh giá giảng viên" trên hệ thống.`,
        `Tôi có thể xem lại các bài kiểm tra đã chấm không?
- Nếu giảng viên cho phép, bạn sẽ thấy kết quả và nhận xét sau khi chấm xong.`,
        `Có thể đăng ký học phần bổ sung không?
- Liên hệ phòng đào tạo để biết các học phần bổ sung có thể đăng ký.`,
        `Tôi có thể kiểm tra trạng thái bảo lưu không?
- Vào mục "Bảo lưu" hoặc hỏi phòng đào tạo để biết trạng thái bảo lưu.`,
        `Có thể sử dụng hệ thống trên máy tính bảng không?
- Hệ thống hỗ trợ tốt trên máy tính bảng qua trình duyệt web.`,
        `Tôi có thể yêu cầu hỗ trợ cá nhân hóa không?
- Gửi yêu cầu qua mục "Hỗ trợ" để được tư vấn cá nhân hóa lộ trình học.`,
        `Có thể đăng ký nhận thông báo khi có bài tập mới không?
- Bật thông báo trong mục "Cài đặt thông báo" để nhận thông báo bài tập mới.`,
        `Tôi có thể kiểm tra trạng thái đăng ký lớp học không?
- Vào mục "Lớp học của tôi" để xem trạng thái đăng ký từng lớp.`,
        `Có thể sử dụng hệ thống cho các kỳ thi quốc tế không?
- Liên hệ phòng đào tạo để biết các kỳ thi quốc tế được hỗ trợ.`,
        `Tôi có thể yêu cầu cấp giấy xác nhận sinh viên không?
- Liên hệ phòng đào tạo hoặc quản trị viên để được cấp giấy xác nhận.`,
        `Có thể sử dụng hệ thống để học ngoại ngữ không?
- Một số chương trình có hỗ trợ học ngoại ngữ, kiểm tra danh sách khóa học.`,
        `Tôi có thể kiểm tra trạng thái học bổng không?
- Vào mục "Học bổng" để xem trạng thái xét duyệt và kết quả học bổng.`,
        `Có thể đăng ký nhận thông báo khi có điểm mới không?
- Bật thông báo trong "Cài đặt thông báo" để nhận thông báo điểm số mới.`,
        `Tôi có thể kiểm tra trạng thái khiếu nại không?
- Vào mục "Khiếu nại" để theo dõi trạng thái xử lý khiếu nại.`,
        `Có thể sử dụng hệ thống để học kỹ năng mềm không?
- Một số khóa học kỹ năng mềm có trên hệ thống, kiểm tra danh sách khóa học.`,
        `Tôi có thể kiểm tra trạng thái đăng ký thi lại không?
- Vào mục "Thi lại" hoặc hỏi phòng đào tạo để biết trạng thái đăng ký thi lại.`,
        `Có thể sử dụng hệ thống để học theo nhóm không?
- Sử dụng chức năng nhóm học hoặc diễn đàn để học theo nhóm.`,
        `Tôi có thể kiểm tra trạng thái đăng ký môn học không?
- Vào mục "Đăng ký môn học" để xem trạng thái từng môn đã đăng ký.`,
        `Có thể sử dụng hệ thống để học trực tuyến với giảng viên nước ngoài không?
- Một số chương trình có giảng viên nước ngoài, kiểm tra thông tin khóa học.`,
        `Tôi có thể kiểm tra trạng thái đăng ký học phần không?
- Vào mục "Đăng ký học phần" để xem trạng thái từng học phần.`,
        `Có thể sử dụng hệ thống để học các môn tự chọn không?
- Đăng ký các môn tự chọn trong mục "Đăng ký môn học" nếu chương trình hỗ trợ.`,
        `Tôi có thể kiểm tra trạng thái đăng ký học lại không?
- Vào mục "Học lại" để xem trạng thái đăng ký học lại các môn đã trượt.`,
        `Có thể sử dụng hệ thống để học các môn chuyên ngành không?
- Đăng ký các môn chuyên ngành trong mục "Đăng ký môn học" nếu chương trình hỗ trợ.`,
        `Tôi có thể kiểm tra trạng thái đăng ký học phần bổ sung không?
- Vào mục "Học phần bổ sung" để xem trạng thái đăng ký.`,
        `Có thể sử dụng hệ thống để học các môn đại cương không?
- Đăng ký các môn đại cương trong mục "Đăng ký môn học" nếu chương trình hỗ trợ.`,
        `Tôi có thể kiểm tra trạng thái đăng ký học phần tự chọn không?
- Vào mục "Học phần tự chọn" để xem trạng thái đăng ký.`,
        `Có thể sử dụng hệ thống để học các môn bắt buộc không?
- Đăng ký các môn bắt buộc trong mục "Đăng ký môn học" nếu chương trình hỗ trợ.`,
        `Tôi có thể kiểm tra trạng thái đăng ký học phần bắt buộc không?
- Vào mục "Học phần bắt buộc" để xem trạng thái đăng ký.`,
        `Mẹo để hoàn thành khóa học đúng hạn:
- Lên kế hoạch học tập rõ ràng, chia nhỏ mục tiêu theo tuần/ngày.
- Đặt lịch học cố định và tuân thủ.
- Hoàn thành từng bài học, bài tập đúng tiến độ, không để dồn việc cuối kỳ.`,
        `Làm sao để giữ động lực học online?
- Đặt mục tiêu rõ ràng cho từng khóa học.
- Tự thưởng cho bản thân khi hoàn thành mục tiêu nhỏ.
- Tham gia thảo luận, hỏi đáp để tăng tương tác và cảm hứng.`,
        `Cách quản lý thời gian khi học e-learning:
- Sử dụng lịch cá nhân hoặc ứng dụng nhắc nhở để lên lịch học.
- Ưu tiên các nhiệm vụ quan trọng, tránh trì hoãn.
- Chia nhỏ thời gian học thành các phiên ngắn (25-45 phút) để tăng hiệu quả.`,
        `Làm sao để ghi nhớ kiến thức lâu hơn?
- Ôn tập lại bài cũ trước khi học bài mới.
- Ghi chú các ý chính, vẽ sơ đồ tư duy.
- Thực hành làm bài tập, áp dụng kiến thức vào thực tế.`,
        `Có nên học nhóm khi học online không?
- Học nhóm giúp trao đổi, giải đáp thắc mắc nhanh hơn.
- Chia sẻ tài liệu, kinh nghiệm học tập với bạn học.
- Tuy nhiên, cần chọn nhóm học nghiêm túc, có mục tiêu rõ ràng.`,
        `Cách đặt câu hỏi hiệu quả cho giảng viên:
- Ghi rõ nội dung chưa hiểu, kèm ví dụ hoặc bối cảnh cụ thể.
- Đặt câu hỏi ngắn gọn, tập trung vào vấn đề chính.
- Chủ động hỏi trên diễn đàn hoặc nhắn tin cho giảng viên.`,
        `Làm sao để không bị xao nhãng khi học online?
- Tắt thông báo mạng xã hội, chọn nơi học yên tĩnh.
- Đặt mục tiêu rõ ràng cho mỗi phiên học.
- Nghỉ giải lao ngắn sau mỗi 30-45 phút học tập.`,
        `Có nên làm bài tập ngay sau khi học xong không?
- Nên làm bài tập ngay để củng cố kiến thức vừa học.
- Nếu gặp khó khăn, xem lại bài giảng hoặc hỏi bạn học/giảng viên.`,
        `Cách ghi chú hiệu quả khi học online:
- Ghi lại các ý chính, công thức, ví dụ quan trọng.
- Sử dụng màu sắc, ký hiệu để phân loại thông tin.
- Xem lại ghi chú trước khi làm bài kiểm tra.`,
        `Làm sao để ôn tập trước kỳ thi hiệu quả?
- Tổng hợp lại các ghi chú, đề cương, bài tập đã làm.
- Làm đề thi thử, tự kiểm tra kiến thức.
- Ôn tập theo nhóm để bổ sung kiến thức còn thiếu.`,
        `Mẹo làm bài tập hiệu quả:
- Đọc kỹ yêu cầu bài tập trước khi bắt đầu.
- Lập dàn ý hoặc kế hoạch giải quyết từng phần.
- Kiểm tra lại bài trước khi nộp để tránh lỗi chính tả, thiếu sót.`,
        `Cách phân bổ thời gian khi làm bài kiểm tra:
- Xem tổng số câu hỏi và thời gian cho phép, chia đều thời gian cho từng phần.
- Làm trước các câu dễ, đánh dấu lại câu khó để làm sau.
- Dành 5-10 phút cuối để kiểm tra lại toàn bộ bài.`,
        `Làm sao để tránh mất điểm do lỗi nhỏ?
- Đọc kỹ đề, chú ý các yêu cầu về định dạng, đơn vị, cách trình bày.
- Đối với bài tự luận, trình bày rõ ràng, có mở bài, thân bài, kết luận.
- Đối với bài trắc nghiệm, kiểm tra lại đáp án trước khi nộp.`,
        `Chuẩn bị gì trước khi làm bài kiểm tra online?
- Đảm bảo thiết bị, mạng internet ổn định.
- Chuẩn bị giấy nháp, bút, tài liệu được phép sử dụng.
- Đăng nhập sớm hơn giờ thi để tránh sự cố kỹ thuật.`,
        `Mẹo giữ bình tĩnh khi làm bài kiểm tra:
- Hít thở sâu, đọc lại đề nếu cảm thấy căng thẳng.
- Nếu bí ý, chuyển sang câu khác rồi quay lại sau.
- Tự nhủ rằng mình đã ôn tập kỹ và làm hết sức.`,
        `Có nên nộp bài sớm không?
- Chỉ nộp bài khi đã kiểm tra kỹ toàn bộ đáp án.
- Nếu còn thời gian, nên xem lại bài để phát hiện lỗi nhỏ.`,
        `Cách làm bài tập nhóm hiệu quả:
- Phân chia công việc rõ ràng cho từng thành viên.
- Thường xuyên trao đổi, cập nhật tiến độ nhóm.
- Tổng hợp, kiểm tra lại bài trước khi nộp chung.`,
        `Làm sao để không bị "quá giờ" khi làm bài kiểm tra online?
- Luôn để ý đồng hồ hoặc bộ đếm thời gian trên hệ thống.
- Ưu tiên làm các câu chắc chắn, không dành quá nhiều thời gian cho một câu.`,
        `Mẹo ôn tập trước khi làm bài kiểm tra:
- Làm lại các bài tập mẫu, đề thi thử.
- Ghi chú lại các lỗi thường gặp để tránh lặp lại.
- Ôn tập theo nhóm để bổ sung kiến thức còn thiếu.`,
        `Cách xử lý khi gặp sự cố kỹ thuật trong lúc làm bài:
- Chụp màn hình lỗi, ghi lại thời gian xảy ra sự cố.
- Báo ngay cho giảng viên hoặc bộ phận hỗ trợ để được xử lý kịp thời.`,
      ];
      documentsToAdd.push(...faqDocs);

      this.logger.log(`Added ${faqDocs.length} FAQ documents`);

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
Thuộc khóa học: ${doc.courseSection?.course?.title || 'Không có'}
URL: ${doc.fileUrl}`;

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
          coursesInfo = `\nKhóa học (${program.programCourses.length} môn):`;
          program.programCourses.forEach((programCourse, index) => {
            coursesInfo += `\n- ${programCourse.course?.title || 'Không có'} - ${programCourse.credits} tín chỉ - Học kỳ: ${programCourse.semester} - Bắt buộc: ${programCourse.isMandatory ? 'Có' : 'Không'}`;
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
