import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Course } from './Course';
import { CourseLesson } from './CourseLesson';
import { CourseDocument } from './CourseDocument';

@Entity('course_sections')
export class CourseSection {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'course_id' })
  courseId: number;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'order_number' })
  orderNumber: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Course, (course) => course.sections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @OneToMany(() => CourseLesson, (lesson) => lesson.section)
  lessons: CourseLesson[];

  @OneToMany(() => CourseDocument, (document) => document.section)
  documents: CourseDocument[];
}
