import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Check,
} from 'typeorm';
import { Course } from './Course';
import { UserStudent } from './UserStudent';
import { UserInstructor } from './UserInstructor';

export enum ReviewType {
  INSTRUCTOR = 'instructor',
  COURSE = 'course',
}

export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('reviews')
@Check('rating BETWEEN 1 AND 5')
export class Review {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'user_student_id' })
  userStudentId: number;

  @Column({
    name: 'review_type',
    type: 'enum',
    enum: ReviewType,
  })
  reviewType: ReviewType;

  @Column({ name: 'course_id' })
  courseId: number;

  @Column({ type: 'int' })
  rating: number;

  @Column({
    name: 'review_text',
    type: 'text',
    nullable: true,
  })
  reviewText: string;

  @Column({
    type: 'enum',
    enum: ReviewStatus,
    default: ReviewStatus.PENDING,
  })
  status: ReviewStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => UserStudent)
  @JoinColumn({ name: 'user_student_id' })
  student: UserStudent;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'course_id' })
  course: Course;
}
