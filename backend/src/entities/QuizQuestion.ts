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
import { Quiz } from './Quiz';
import { QuizOption } from './QuizOption';
import { QuizResponse } from './QuizResponse';

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
}

@Entity('quiz_questions')
export class QuizQuestion {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'quiz_id' })
  quizId: number;

  @Column('text', { name: 'question_text' })
  questionText: string;

  @Column({
    type: 'enum',
    enum: QuestionType,
    name: 'question_type',
  })
  questionType: QuestionType;

  @Column('text', {
    name: 'correct_explanation',
    nullable: true,
  })
  correctExplanation: string | null;

  @Column('int', { default: 1 })
  points: number;

  @Column('int', { name: 'order_number' })
  orderNumber: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Quiz, (quiz) => quiz.questions)
  @JoinColumn({ name: 'quiz_id' })
  quiz: Quiz;

  @OneToMany(() => QuizOption, (option) => option.question)
  options: QuizOption[];

  @OneToMany(() => QuizResponse, (response) => response.question)
  responses: QuizResponse[];
}
