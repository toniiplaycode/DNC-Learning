// Create Notification entity
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
import { TeachingSchedule } from './TeachingSchedule';

export enum NotificationType {
  COURSE = 'course',
  ASSIGNMENT = 'assignment',
  QUIZ = 'quiz',
  SYSTEM = 'system',
  MESSAGE = 'message',
  SCHEDULE = 'schedule',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ length: 255 })
  title: string;

  @Column('text')
  content: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({ name: 'teaching_schedule_id', nullable: true })
  teachingScheduleId: number;

  @Column({ name: 'notification_time', type: 'datetime', nullable: true })
  notificationTime: Date;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => TeachingSchedule, { nullable: true })
  @JoinColumn({ name: 'teaching_schedule_id' })
  teachingSchedule: TeachingSchedule;
}
