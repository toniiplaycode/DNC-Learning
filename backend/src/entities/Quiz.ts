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
import { CourseLesson } from './CourseLesson';
import { UserGrade } from './UserGrade';
import { AcademicClass } from './AcademicClass';
import { QuizQuestion } from './QuizQuestion';
import { QuizAttempt } from './QuizAttempt';

export enum QuizType {
  PRACTICE = 'practice',
  HOMEWORK = 'homework',
  MIDTERM = 'midterm',
  FINAL = 'final',
}

@Entity('quizzes')
export class Quiz {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'lesson_id', nullable: true })
  lessonId: number | null;

  @Column({ name: 'academic_class_id', nullable: true })
  academicClassId: number | null;

  @Column({
    type: 'varchar',
    length: 255,
  })
  title: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string | null;

  @Column({
    name: 'time_limit',
    type: 'int',
    nullable: true,
    comment: 'Time limit in minutes',
  })
  timeLimit: number | null;

  @Column({
    name: 'passing_score',
    type: 'int',
    nullable: true,
  })
  passingScore: number | null;

  @Column({
    name: 'attempts_allowed',
    type: 'int',
    default: 1,
  })
  attemptsAllowed: number;

  @Column({
    name: 'quiz_type',
    type: 'enum',
    enum: QuizType,
    default: QuizType.PRACTICE,
  })
  quizType: QuizType;

  @Column({
    name: 'show_explanation',
    type: 'tinyint',
    default: 1,
  })
  showExplanation: number;

  @Column({
    name: 'start_time',
    type: 'datetime',
    nullable: true,
    comment: 'Thời gian bắt đầu làm bài',
  })
  startTime: Date | null;

  @Column({
    name: 'end_time',
    type: 'datetime',
    nullable: true,
    comment: 'Thời gian kết thúc',
  })
  endTime: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => CourseLesson, (lesson) => lesson.quizzes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'lesson_id' })
  lesson: CourseLesson;

  @ManyToOne(() => AcademicClass, (academicClass) => academicClass.quizzes)
  @JoinColumn({ name: 'academic_class_id' })
  academicClass: AcademicClass;

  // Relationship with UserGrade
  @OneToMany(() => UserGrade, (userGrade) => userGrade.quiz)
  grades: UserGrade[];

  @OneToMany(() => QuizQuestion, (question) => question.quiz)
  questions: QuizQuestion[];

  @OneToMany(() => QuizAttempt, (attempt) => attempt.quiz)
  attempts: QuizAttempt[];
}
