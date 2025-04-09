import { Exclude, Expose, Type } from 'class-transformer';
import { ReviewType } from '../../../entities/Review';

class StudentInfo {
  id: number;
  userId: number;
  fullName: string;
  avatarUrl?: string;

  @Expose()
  user?: {
    id: number;
    username: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
  };
}

class CourseInfo {
  id: number;
  title: string;
  thumbnail: string;
  instructorName: string;
}

export class ReviewResponseDto {
  @Expose()
  id: number;

  @Expose()
  userStudentId: number;

  @Expose()
  courseId: number;

  @Expose()
  reviewType: ReviewType;

  @Expose()
  rating: number;

  @Expose()
  reviewText: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => StudentInfo)
  student?: StudentInfo;

  @Expose()
  @Type(() => CourseInfo)
  course?: CourseInfo;
}
