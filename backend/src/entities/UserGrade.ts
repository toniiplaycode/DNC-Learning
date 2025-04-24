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
import { Course } from './Course';
import { UserInstructor } from './UserInstructor';
import { CourseLesson } from './CourseLesson';
import { QuizAttempt } from './QuizAttempt';
import { AssignmentSubmission } from './AssignmentSubmission';

export enum GradeType {
  ASSIGNMENT = 'assignment',
  QUIZ = 'quiz',
  MIDTERM = 'midterm',
  FINAL = 'final',
  PARTICIPATION = 'participation',
}

@Entity('user_grades')
export class UserGrade {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'graded_by' })
  gradedBy: number;

  @Column({ name: 'course_id', nullable: true })
  courseId: number;

  @Column({ name: 'lesson_id', nullable: true })
  lessonId: number | null;

  @Column({ name: 'assignment_submission_id', nullable: true })
  assignmentSubmissionId: number | null;

  @Column({ name: 'quiz_attempt_id', nullable: true })
  quizAttemptId: number | null;

  @Column({
    name: 'grade_type',
    type: 'enum',
    enum: GradeType,
  })
  gradeType: GradeType;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
  })
  score: number;

  @Column({
    name: 'max_score',
    type: 'decimal',
    precision: 5,
    scale: 2,
  })
  maxScore: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 1.0,
  })
  weight: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  feedback: string | null;

  @Column({
    name: 'graded_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  gradedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @ManyToOne(() => UserInstructor)
  @JoinColumn({ name: 'graded_by' })
  instructor: UserInstructor;

  @ManyToOne(() => CourseLesson, { nullable: true })
  @JoinColumn({ name: 'lesson_id' })
  lesson: CourseLesson | null;

  @ManyToOne(() => AssignmentSubmission, { nullable: true })
  @JoinColumn({ name: 'assignment_submission_id' })
  assignmentSubmission: AssignmentSubmission | null;

  @ManyToOne(() => QuizAttempt, { nullable: true })
  @JoinColumn({ name: 'quiz_attempt_id' })
  quizAttempt: QuizAttempt | null;
}
