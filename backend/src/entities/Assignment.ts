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
import { AcademicClass } from './AcademicClass';
import { AssignmentSubmission } from './AssignmentSubmission';

export enum AssignmentType {
  PRACTICE = 'practice',
  HOMEWORK = 'homework',
  MIDTERM = 'midterm',
  FINAL = 'final',
  PROJECT = 'project',
}

@Entity('assignments')
export class Assignment {
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
    name: 'due_date',
    type: 'timestamp',
    nullable: true,
  })
  dueDate: Date | null;

  @Column({
    name: 'max_score',
    type: 'int',
    nullable: true,
  })
  maxScore: number | null;

  @Column({
    name: 'file_requirements',
    type: 'text',
    nullable: true,
  })
  fileRequirements: string | null;

  @Column({
    name: 'assignment_type',
    type: 'enum',
    enum: AssignmentType,
    default: AssignmentType.PRACTICE,
  })
  assignmentType: AssignmentType;

  @Column({
    name: 'start_time',
    type: 'datetime',
    nullable: true,
  })
  startTime: Date | null;

  @Column({
    name: 'end_time',
    type: 'datetime',
    nullable: true,
  })
  endTime: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => CourseLesson, (lesson) => lesson.assignments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'lesson_id' })
  lesson: CourseLesson;

  @ManyToOne(() => AcademicClass, (academicClass) => academicClass.assignments)
  @JoinColumn({ name: 'academic_class_id' })
  academicClass: AcademicClass;

  @OneToMany(() => AssignmentSubmission, (submission) => submission.assignment)
  assignmentSubmissions: AssignmentSubmission[];
}
