import {
  MiddlewareConsumer,
  Module,
  RequestMethod,
  NestModule,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoursesModule } from './modules/courses/courses.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/Course';
import { Category } from './entities/Category';
import { User } from './entities/User';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InstructorMiddleware } from './common/middleware/instructor.middleware';
import { AuthMiddleware } from './common/middleware/auth.middleware';
import { JwtModule } from '@nestjs/jwt';
import { CourseSection } from './entities/CourseSection';
import { CourseLesson } from './entities/CourseLesson';
import { Document } from './entities/Document';
import { UserInstructor } from './entities/UserInstructor';
import { Review } from './entities/Review';
import { UserStudent } from './entities/UserStudent';
import { Enrollment } from './entities/Enrollment';
import { UserInstructorsModule } from './modules/user-instructors/user-instructors.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { Forum } from './entities/Forum';
import { ForumReply } from './entities/ForumReply';
import { ForumLike } from './entities/ForumLike';
import { ForumsModule } from './modules/forums/forums.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { Certificate } from './entities/Certificate';
import { CertificatesModule } from './modules/certificates/certificates.module';
import { UserGrade } from './entities/UserGrade';
import { Assignment } from './entities/Assignment';
import { Quiz } from './entities/Quiz';
import { UserGradesModule } from './modules/user-grades/user-grades.module';
import { AcademicClass } from './entities/AcademicClass';
import { CourseProgress } from './entities/CourseProgress';
import { CourseLessonDiscussion } from './entities/CourseLessonDiscussion';
import { CourseLessonDiscussionsModule } from './modules/course-lesson-discussions/course-lesson-discussions.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { QuizAttempt } from './entities/QuizAttempt';
import { QuizQuestion } from './entities/QuizQuestion';
import { QuizOption } from './entities/QuizOption';
import { QuizResponse } from './entities/QuizResponse';
import { QuizzesModule } from './modules/quizzes/quizzes.module';
import { UserStudentAcademic } from './entities/UserStudentAcademic';
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { AssignmentSubmission } from './entities/AssignmentSubmission';
import { AssignmentSubmissionsModule } from './modules/assignment-submissions/assignment-submissions.module';
import { AcademicClassInstructorsModule } from './modules/academic-class-instructors/academic-class-instructors.module';
import { AcademicClassInstructor } from './entities/AcademicClassInstructor';
import { CourseSectionModule } from './modules/course-sections/course-section.module';
import { CourseLessonsModule } from './modules/course-lessons/course-lessons.module';
import { MessagesModule } from './modules/messages/messages.module';
import { Message } from './entities/Message';
import { ChatbotResponse } from './entities/ChatbotResponse';
import { CliModule } from './modules/chatbot-response/cli.module';
import { AcademicClassCourse } from './entities/AcademicClassCourse';
import { AcademicClassCoursesModule } from './modules/academic-class-courses/academic-class-courses.module';
import { AcademicClassesModule } from './modules/academic-classes/academic-class.module';
import { Notification } from './entities/Notification';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { CourseProgressModule } from './modules/course-progress/course-progress.module';
import { RagModule } from './modules/rag/rag.module';
import { Payment } from './entities/Payment';
import { PaymentsModule } from './modules/payments/payments.module';
import { ZalopayModule } from './modules/zalopay/zaloplay.module';
import { FilesModule } from './modules/files/files.module';
import { TeachingSchedule } from './entities/TeachingSchedule';
import { SessionAttendance } from './entities/SessionAttendance';
import { TeachingSchedulesModule } from './modules/teaching-schedules/teaching-schedules.module';
import { SessionAttendancesModule } from './modules/session-attendances/session-attendances.module';
import { OpenAIModule } from './modules/openai/openai.module';
import { GroupMessagesModule } from './modules/group-messages/group-messages.module';
import { GroupMessage } from './entities/GroupMessage';
import { Faculty } from './entities/Faculty';
import { Major } from './entities/Major';
import { Program } from './entities/Program';
import { ProgramCourse } from './entities/ProgramCourse';
import { FacultyModule } from './modules/faculties/faculty.module';
import { MajorModule } from './modules/majors/major.module';
import { ProgramModule } from './modules/programs/program.module';
import { ProgramCourseModule } from './modules/program-courses/program-course.module';
@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN', '1h'),
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port: +configService.get('DB_PORT', '3306'),
        username: configService.get('DB_USERNAME', 'root'),
        password: configService.get('DB_PASSWORD', ''),
        database: configService.get('DB_DATABASE', 'system_elearning'),
        entities: [
          Course,
          User,
          Category,
          CourseSection,
          CourseLesson,
          Document,
          UserInstructor,
          UserStudent,
          Review,
          Enrollment,
          Forum,
          ForumReply,
          ForumLike,
          Certificate,
          UserGrade,
          Assignment,
          Quiz,
          AcademicClass,
          CourseProgress,
          CourseLessonDiscussion,
          QuizAttempt,
          QuizQuestion,
          QuizOption,
          QuizResponse,
          UserStudentAcademic,
          AssignmentSubmission,
          AcademicClassInstructor,
          Message,
          ChatbotResponse,
          AcademicClassCourse,
          Notification,
          TeachingSchedule,
          SessionAttendance,
          Payment,
          GroupMessage,
          Faculty,
          Major,
          Program,
          ProgramCourse,
        ],
      }),
      inject: [ConfigService],
    }),
    CoursesModule,
    UsersModule,
    AuthModule,
    UserInstructorsModule,
    CategoriesModule,
    ForumsModule,
    EnrollmentsModule,
    CertificatesModule,
    UserGradesModule,
    CourseLessonDiscussionsModule,
    DocumentsModule,
    ReviewsModule,
    QuizzesModule,
    AssignmentsModule,
    AssignmentSubmissionsModule,
    AcademicClassInstructorsModule,
    CourseSectionModule,
    CourseLessonsModule,
    MessagesModule,
    CliModule,
    AcademicClassCoursesModule,
    AcademicClassesModule,
    NotificationsModule,
    CourseProgressModule,
    RagModule,
    PaymentsModule,
    ZalopayModule,
    FilesModule,
    TeachingSchedulesModule,
    SessionAttendancesModule,
    OpenAIModule,
    GroupMessagesModule,
    FacultyModule,
    MajorModule,
    ProgramModule,
    ProgramCourseModule,
  ],
  controllers: [AppController],
  providers: [AppService, AuthMiddleware, InstructorMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {}
}
