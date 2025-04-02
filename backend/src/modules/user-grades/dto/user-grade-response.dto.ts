import { Exclude, Expose, Type } from 'class-transformer';
import { GradeType } from '../../../entities/UserGrade';

class UserInfo {
  id: number;
  username: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
}

class CourseInfo {
  id: number;
  title: string;
  thumbnail: string;
}

class InstructorInfo {
  id: number;
  userId: number;
  user: {
    id: number;
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
}

class AssignmentInfo {
  id: number;
  title: string;
  type: string;
}

class QuizInfo {
  id: number;
  title: string;
  type: string;
}

class LessonInfo {
  id: number;
  title: string;
  contentType: string;
}

@Exclude()
export class UserGradeResponseDto {
  @Expose()
  id: number;

  @Expose()
  userId: number;

  @Expose()
  courseId: number;

  @Expose()
  gradedBy: number;

  @Expose()
  lessonId?: number;

  @Expose()
  assignmentId?: number;

  @Expose()
  quizId?: number;

  @Expose()
  gradeType: GradeType;

  @Expose()
  score: number;

  @Expose()
  maxScore: number;

  @Expose()
  weight: number;

  @Expose()
  feedback?: string;

  @Expose()
  gradedAt: Date;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => UserInfo)
  user?: UserInfo;

  @Expose()
  @Type(() => CourseInfo)
  course?: CourseInfo;

  @Expose()
  @Type(() => InstructorInfo)
  instructor?: InstructorInfo;

  @Expose()
  @Type(() => LessonInfo)
  lesson?: LessonInfo;

  @Expose()
  @Type(() => AssignmentInfo)
  assignment?: AssignmentInfo;

  @Expose()
  @Type(() => QuizInfo)
  quiz?: QuizInfo;
}
