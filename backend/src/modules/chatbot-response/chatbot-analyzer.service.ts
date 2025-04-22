import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatbotResponse } from 'src/entities/ChatbotResponse';
import { UserInstructor } from 'src/entities/UserInstructor';
import { Course } from 'src/entities/Course';
import { Repository } from 'typeorm';
import { Enrollment, EnrollmentStatus } from 'src/entities/Enrollment';
import { Forum, ForumStatus } from 'src/entities/Forum';
import { Review } from 'src/entities/Review';
import { Quiz } from 'src/entities/Quiz';
import { Assignment } from 'src/entities/Assignment';
import { Certificate } from 'src/entities/Certificate';
import { Category } from 'src/entities/Category';
import { Document } from 'src/entities/Document';

@Injectable()
export class ChatbotAnalyzerService {
  constructor(
    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
    @InjectRepository(UserInstructor)
    private instructorRepo: Repository<UserInstructor>,
    @InjectRepository(ChatbotResponse)
    private chatbotResponseRepo: Repository<ChatbotResponse>,
    @InjectRepository(Review)
    private reviewRepo: Repository<Review>,
    @InjectRepository(Quiz)
    private quizRepo: Repository<Quiz>,
    @InjectRepository(Assignment)
    private assignmentRepo: Repository<Assignment>,
    @InjectRepository(Certificate)
    private certificateRepo: Repository<Certificate>,
    @InjectRepository(Enrollment)
    private enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(Forum)
    private forumRepo: Repository<Forum>,
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
    @InjectRepository(Document)
    private documentRepo: Repository<Document>,
  ) {}

  async analyzeDatabaseAndGenerateResponses() {
    try {
      console.log('🔍 Starting database analysis...');
      await this.analyzeCourses();
      await this.analyzeInstructors();
      await this.analyzeAssessments();
      await this.analyzeLearningProgress();
      await this.analyzeForums();
      await this.analyzeDocuments();
      await this.analyzeCategories();
      console.log('✅ Analysis completed');
    } catch (error) {
      console.error('❌ Analysis error:', error);
      throw error;
    }
  }

  private async analyzeCourses() {
    try {
      // Get courses with their categories
      const courses = await this.courseRepo.find({
        relations: ['category'],
      });

      const courseKeywords = ['khóa học', 'danh sách khóa học', 'học những gì'];

      // Extract unique category names
      const categoryNames = [
        ...new Set(
          courses
            .filter((c) => c.category) // Filter out courses without category
            .map((c) => c.category.name),
        ),
      ];

      const courseResponse = {
        keywords: courseKeywords,
        response: `DNC cung cấp ${courses.length} khóa học. Các khóa học được phân loại thành: ${categoryNames.join(', ')}`,
        category: 'course_list',
        confidence: 0.9,
      };

      await this.saveChatbotResponse(courseResponse);
    } catch (error) {
      console.error('❌ Error in analyzeCourses:', error);
      throw error;
    }
  }

  private async analyzeInstructors() {
    const instructors = await this.instructorRepo.find();

    const instructorResponse: Partial<ChatbotResponse> = {
      keywords: ['giảng viên', 'instructor', 'người dạy'],
      response: `DNC có ${instructors.length} giảng viên. Các giảng viên đều là chuyên gia trong lĩnh vực của mình.`,
      category: 'instructor_info',
      confidence: 0.9,
    };

    await this.saveChatbotResponse(instructorResponse);
  }

  private async analyzeStatistics() {
    // Phân tích và tạo các response về thống kê
    const stats = await this.calculateSystemStats();
    await this.saveChatbotResponse({
      keywords: ['thống kê', 'số liệu', 'statistics'],
      response: `Hiện tại DNC có:
                 - ${stats.totalCourses} khóa học
                 - ${stats.totalInstructors} giảng viên
                 - ${stats.totalStudents} học viên
                 - Tỷ lệ hoàn thành khóa học: ${stats.completionRate}%`,
      category: 'system_stats',
      confidence: 0.95,
    });
  }

  private async analyzeAssessments() {
    const quizzes = await this.quizRepo.find();
    const assignments = await this.assignmentRepo.find();

    await this.saveChatbotResponse({
      keywords: ['bài tập', 'kiểm tra', 'quiz', 'assignment'],
      response: `DNC cung cấp nhiều hình thức đánh giá:
- ${quizzes.length} bài kiểm tra (quiz)
- ${assignments.length} bài tập
Mỗi khóa học có các bài kiểm tra và bài tập riêng để đánh giá tiến độ học tập.`,
      category: 'assessments',
      confidence: 0.9,
    });
  }

  private async analyzeLearningProgress() {
    const enrollments = await this.enrollmentRepo.find();
    const certificates = await this.certificateRepo.find();
    const completedEnrollments = enrollments.filter(
      (e) => e.status === EnrollmentStatus.COMPLETED,
    );

    await this.saveChatbotResponse({
      keywords: ['chứng chỉ', 'hoàn thành', 'certificate', 'completion'],
      response: `Tại DNC:
- ${enrollments.length} lượt đăng ký khóa học
- ${completedEnrollments.length} học viên đã hoàn thành khóa học
- ${certificates.length} chứng chỉ đã được cấp
Học viên sẽ nhận được chứng chỉ sau khi hoàn thành khóa học.`,
      category: 'learning_progress',
      confidence: 0.9,
    });
  }

  private async analyzeForums() {
    const forums = await this.forumRepo.find();
    const activeForums = forums.filter((f) => f.status === ForumStatus.ACTIVE);

    await this.saveChatbotResponse({
      keywords: ['diễn đàn', 'thảo luận', 'forum', 'discussion'],
      response: `DNC có ${activeForums.length} diễn đàn thảo luận đang hoạt động.
Học viên có thể trao đổi, thảo luận và đặt câu hỏi với giảng viên và các học viên khác.`,
      category: 'forums',
      confidence: 0.85,
    });
  }

  private async analyzeCategories() {
    const categories = await this.categoryRepo.find();

    // Get courses count by category using left join
    const coursesByCategory = await this.courseRepo
      .createQueryBuilder('course')
      .leftJoin('course.category', 'category')
      .select('category.name', 'categoryName')
      .addSelect('COUNT(course.id)', 'count')
      .groupBy('category.name')
      .getRawMany();

    await this.saveChatbotResponse({
      keywords: [
        'danh mục',
        'lĩnh vực',
        'categories',
        'khóa học theo lĩnh vực',
      ],
      response: `DNC có ${categories.length} lĩnh vực đào tạo:
${coursesByCategory.map((c) => `- ${c.categoryName}: ${c.count} khóa học`).join('\n')}`,
      category: 'categories',
      confidence: 0.9,
    });
  }

  private async analyzeDocuments() {
    const documents = await this.documentRepo.find();
    const documentTypes = [...new Set(documents.map((d) => d.fileType))];

    await this.saveChatbotResponse({
      keywords: ['tài liệu', 'document', 'learning materials'],
      response: `DNC cung cấp ${documents.length} tài liệu học tập.
Các định dạng tài liệu: ${documentTypes.join(', ')}.
Tài liệu được cung cấp trong từng bài học để hỗ trợ việc học tập.`,
      category: 'documents',
      confidence: 0.85,
    });
  }

  private async saveChatbotResponse(data: Partial<ChatbotResponse>) {
    try {
      const existing = await this.chatbotResponseRepo.findOne({
        where: { category: data.category },
      });

      if (existing) {
        const result = await this.chatbotResponseRepo.update(existing.id, {
          ...data,
          keywords: data.keywords, // TypeORM will handle JSON conversion
        });
        console.log(`✔️ Updated response for category: ${data.category}`);
        return result;
      } else {
        const result = await this.chatbotResponseRepo.save({
          ...data,
          keywords: data.keywords, // TypeORM will handle JSON conversion
        });
        console.log(`✔️ Created new response for category: ${data.category}`);
        return result;
      }
    } catch (error) {
      console.error(
        `❌ Error saving response for category ${data.category}:`,
        error,
      );
      throw error;
    }
  }

  // Các helper methods
  private analyzePriceRanges(courses: Course[]) {
    const prices = courses.map((c) => c.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: prices.reduce((a, b) => a + b, 0) / prices.length,
    };
  }

  private analyzeSpecializations(instructors: UserInstructor[]) {
    return [...new Set(instructors.map((i) => i.specialization))];
  }

  private async calculateSystemStats() {
    // Implement system statistics calculation
    return {
      totalCourses: await this.courseRepo.count(),
      totalInstructors: await this.instructorRepo.count(),
      totalStudents: 0, // Implement actual count
      completionRate: 0, // Implement actual calculation
    };
  }
}
