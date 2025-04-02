import { Exclude, Expose, Type } from 'class-transformer';
import { DiscussionStatus } from '../../../entities/CourseLessonDiscussion';

class UserInfo {
  id: number;
  username: string;
  email: string;
  avatarUrl?: string;
}

class ReplyInfo {
  id: number;
  content: string;
  status: DiscussionStatus;
  createdAt: Date;
  updatedAt: Date;
  user: UserInfo;
}

@Exclude()
export class DiscussionResponseDto {
  @Expose()
  id: number;

  @Expose()
  lessonId: number;

  @Expose()
  userId: number;

  @Expose()
  parentId: number | null;

  @Expose()
  content: string;

  @Expose()
  status: DiscussionStatus;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => UserInfo)
  user?: UserInfo;

  @Expose()
  @Type(() => ReplyInfo)
  replies?: ReplyInfo[];
}
