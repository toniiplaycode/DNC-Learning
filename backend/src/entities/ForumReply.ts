import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';
import { Forum } from './Forum';

@Entity('forum_replies')
export class ForumReply {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'forum_id', type: 'bigint' })
  forumId: number;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @Column({ name: 'reply_id', type: 'bigint', nullable: true })
  replyId: number | null;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'is_solution', type: 'tinyint', default: 0 })
  isSolution: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Forum, (forum) => forum.replies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'forum_id' })
  forum: Forum;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => ForumReply, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reply_id' })
  reply: ForumReply | null;

  // Các trường tính toán (không lưu trong DB)
  likeCount?: number;
  isLiked?: boolean;
}
