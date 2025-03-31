import { Expose, Type, Exclude } from 'class-transformer';
import { GradeType } from '../../../entities/UserGrade';

class UserInfo {
  id: number;
  username: string;
  email: string;
  fullName: string;
}

class CourseInfo {
  id: number;
  title: string;
}

class LessonInfo {
  id: number;
  title: string;
}

class InstructorInfo {
  id: number;
  userId: number;
  fullName: string;
}

class AssignmentInfo {
  id: number;
  title: string;
  assignmentType: string;
}

class QuizInfo {
  id: number;
  title: string;
  quizType: string;
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
  lessonId: number | null;

  @Expose()
  assignmentId: number | null;

  @Expose()
  quizId: number | null;

  @Expose()
  gradeType: GradeType;

  @Expose()
  score: number;

  @Expose()
  maxScore: number;

  @Expose()
  weight: number;

  @Expose()
  feedback: string | null;

  @Expose()
  gradedAt: Date;

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

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
