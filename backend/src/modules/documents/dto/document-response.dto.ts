import { Exclude, Expose, Type } from 'class-transformer';

class SectionInfo {
  id: number;
  title: string;
}

class UserInfo {
  id: number;
  username: string;
  fullName: string;
  avatarUrl?: string;
}

class InstructorInfo {
  id: number;
  userId: number;
  bio?: string;

  @Type(() => UserInfo)
  user?: UserInfo;
}

@Exclude()
export class DocumentResponseDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  courseSectionId: number;

  @Expose()
  fileUrl: string;

  @Expose()
  thumbnailUrl?: string;

  @Expose()
  filePath?: string;

  @Expose()
  fileType: string;

  @Expose()
  duration?: string;

  @Expose()
  instructorId?: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => SectionInfo)
  section?: SectionInfo;

  @Expose()
  @Type(() => InstructorInfo)
  instructor?: InstructorInfo;
}
