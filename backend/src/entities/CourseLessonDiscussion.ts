import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from './User';
import { CourseLesson } from './CourseLesson';

export enum DiscussionStatus {
  ACTIVE = 'active',
  HIDDEN = 'hidden',
  LOCKED = 'locked',
}

@Entity('course_lesson_discussions')
export class CourseLessonDiscussion {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'lesson_id' })
  lessonId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({
    name: 'parent_id',
    nullable: true,
    comment: 'NULL cho thảo luận chính, ID của thảo luận cha cho phản hồi',
  })
  parentId: number | null;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: DiscussionStatus,
    default: DiscussionStatus.ACTIVE,
  })
  status: DiscussionStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => CourseLesson, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lesson_id' })
  lesson: CourseLesson;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Self-referencing relation - Parent discussion
  @ManyToOne(() => CourseLessonDiscussion, (discussion) => discussion.replies)
  @JoinColumn({ name: 'parent_id' })
  parent: CourseLessonDiscussion | null;

  // Self-referencing relation - Reply discussions
  @OneToMany(() => CourseLessonDiscussion, (discussion) => discussion.parent)
  replies: CourseLessonDiscussion[];
}
