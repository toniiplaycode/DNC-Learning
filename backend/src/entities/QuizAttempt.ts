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
import { Quiz } from './Quiz';
import { QuizResponse } from './QuizResponse';

export enum AttemptStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
}

@Entity('quiz_attempts')
export class QuizAttempt {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'quiz_id' })
  quizId: number;

  @Column('timestamp', { name: 'start_time' })
  startTime: Date;

  @Column('timestamp', {
    name: 'end_time',
    nullable: true,
  })
  endTime: Date | null;

  @Column('decimal', {
    precision: 5,
    scale: 2,
    nullable: true,
  })
  score: number | null;

  @Column({
    type: 'enum',
    enum: AttemptStatus,
    default: AttemptStatus.IN_PROGRESS,
  })
  status: AttemptStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Quiz)
  @JoinColumn({ name: 'quiz_id' })
  quiz: Quiz;

  @OneToMany(() => QuizResponse, (response) => response.attempt)
  responses: QuizResponse[];
}
