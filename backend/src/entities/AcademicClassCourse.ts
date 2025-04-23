import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AcademicClass } from './AcademicClass';
import { Course } from './Course';
import { UserInstructor } from './UserInstructor';

@Entity('academic_class_courses')
export class AcademicClassCourse {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'class_id', type: 'bigint' })
  classId: number;

  @Column({ name: 'course_id', type: 'bigint' })
  courseId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => AcademicClass)
  @JoinColumn({ name: 'class_id' })
  academicClass: AcademicClass;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'course_id' })
  course: Course;
}
