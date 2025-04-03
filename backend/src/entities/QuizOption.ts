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
import { QuizQuestion } from './QuizQuestion';
import { QuizResponse } from './QuizResponse';

@Entity('quiz_options')
export class QuizOption {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'question_id' })
  questionId: number;

  @Column('text', { name: 'option_text' })
  optionText: string;

  @Column('boolean', {
    name: 'is_correct',
    default: false,
  })
  isCorrect: boolean;

  @Column('int', { name: 'order_number' })
  orderNumber: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => QuizQuestion, (question) => question.options, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'question_id' })
  question: QuizQuestion;

  @OneToMany(() => QuizResponse, (response) => response.selectedOption)
  responses: QuizResponse[];
}
