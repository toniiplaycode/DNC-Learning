import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './User';
import { CourseLesson } from './CourseLesson';

@Entity('course_progress')
@Unique('unique_progress', ['userId', 'lessonId'])
export class CourseProgress {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({
    name: 'user_id',
    type: 'bigint',
  })
  userId: number;

  @Column({
    name: 'lesson_id',
    type: 'bigint',
  })
  lessonId: number;

  @Column({
    name: 'completed_at',
    type: 'timestamp',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  completedAt: Date;

  @Column({
    name: 'last_accessed',
    type: 'timestamp',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  lastAccessed: Date;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => CourseLesson)
  @JoinColumn({ name: 'lesson_id' })
  lesson: CourseLesson;
}
