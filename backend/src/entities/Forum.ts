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
import { Course } from './Course';
import { ForumReply } from './ForumReply';
import { ForumLike } from './ForumLike';

export enum ForumStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  CLOSED = 'closed',
}

@Entity('forums')
export class Forum {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'course_id' })
  courseId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'thumbnail_url', nullable: true })
  thumbnailUrl: string;

  @Column({
    type: 'enum',
    enum: ForumStatus,
    default: ForumStatus.ACTIVE,
  })
  status: ForumStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => ForumReply, (reply) => reply.forum)
  replies: ForumReply[];

  @OneToMany(() => ForumLike, (like) => like.forum)
  likes: ForumLike[];

  // Các trường tính toán (không lưu trong DB)
  replyCount?: number;
  likeCount?: number;
  isLiked?: boolean;
}
