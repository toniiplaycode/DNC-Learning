import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { QuizAttempt } from './QuizAttempt';
import { QuizQuestion } from './QuizQuestion';
import { QuizOption } from './QuizOption';

@Entity('quiz_responses')
export class QuizResponse {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'attempt_id' })
  attemptId: number;

  @Column({ name: 'question_id' })
  questionId: number;

  @Column({
    name: 'selected_option_id',
    nullable: true,
  })
  selectedOptionId: number | null;

  @Column('decimal', {
    precision: 5,
    scale: 2,
    nullable: true,
  })
  score: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => QuizAttempt, (attempt) => attempt.responses)
  @JoinColumn({ name: 'attempt_id' })
  attempt: QuizAttempt;

  @ManyToOne(() => QuizQuestion, (question) => question.responses)
  @JoinColumn({ name: 'question_id' })
  question: QuizQuestion;

  @ManyToOne(() => QuizOption, (option) => option.responses)
  @JoinColumn({ name: 'selected_option_id' })
  selectedOption: QuizOption | null;
}
