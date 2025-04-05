import { Exclude, Expose, Type } from 'class-transformer';
import { EnrollmentStatus } from '../../../entities/Enrollment';

class CourseInfo {
  id: number;
  title: string;
  thumbnail: string;
  instructorName: string;
}

class UserInfo {
  id: number;
  username: string;
  email: string;
  fullName: string;
}

@Exclude()
export class EnrollmentResponseDto {
  @Expose()
  id: number;

  @Expose()
  userId: number;

  @Expose()
  courseId: number;

  @Expose()
  status: EnrollmentStatus;

  @Expose()
  enrollmentDate: Date;

  @Expose()
  completionDate: Date;

  @Expose()
  @Type(() => CourseInfo)
  course?: CourseInfo;

  @Expose()
  @Type(() => UserInfo)
  user?: UserInfo;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
