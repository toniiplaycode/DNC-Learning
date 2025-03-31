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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
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
    TypeOrmModule.forRoot({
      type: process.env.DB_DRIVER as 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
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
      ],
      // synchronize: true, // tự động tạo bảng trong entity (chỉ dùng trong môi tường dev)
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
