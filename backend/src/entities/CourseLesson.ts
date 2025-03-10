import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CourseSection } from './CourseSection';

export enum ContentType {
  VIDEO = 'video',
  DOCUMENT = 'document',
  QUIZ = 'quiz',
  ASSIGNMENT = 'assignment',
}

@Entity('course_lessons')
export class CourseLesson {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'section_id' })
  sectionId: number;

  @Column({ length: 255 })
  title: string;

  @Column({
    name: 'content_type',
    type: 'enum',
    enum: ContentType,
    nullable: true,
  })
  contentType: ContentType;

  @Column({ name: 'content_url', length: 255, nullable: true })
  contentUrl: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ nullable: true, comment: 'Duration in minutes' })
  duration: number;

  @Column({ name: 'order_number' })
  orderNumber: number;

  @Column({ name: 'is_free', default: false })
  isFree: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => CourseSection, (section) => section.lessons, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'section_id' })
  section: CourseSection;
}
