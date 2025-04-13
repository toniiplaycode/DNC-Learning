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
        ],
        // synchronize: true, // tự động tạo bảng trong entity (chỉ dùng trong môi tường dev)
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
  ],
  controllers: [AppController],
  providers: [AppService, AuthMiddleware, InstructorMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware, InstructorMiddleware)
      .forRoutes(
        { path: 'courses', method: RequestMethod.POST },
        { path: 'courses/:id', method: RequestMethod.PATCH },
        { path: 'courses/:id', method: RequestMethod.DELETE },
      );
  }
}
