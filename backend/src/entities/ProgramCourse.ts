import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Program } from './Program';
import { Course } from './Course';

@Entity('program_courses')
export class ProgramCourse {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'program_id' })
  programId: number;

  @Column({ name: 'course_id' })
  courseId: number;

  @Column({
    type: 'int',
    comment: 'Số tín chỉ của môn học',
  })
  credits: number;

  @Column({
    name: 'is_mandatory',
    type: 'boolean',
    default: true,
    comment: 'Môn bắt buộc hay tùy chọn',
  })
  isMandatory: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Program)
  @JoinColumn({ name: 'program_id' })
  program: Program;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'course_id' })
  course: Course;
}
