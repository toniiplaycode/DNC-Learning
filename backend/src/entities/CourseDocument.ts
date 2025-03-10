import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Course } from './Course';
import { CourseSection } from './CourseSection';
import { Document } from './Document';

export enum DocumentVisibility {
  ALL = 'all',
  ENROLLED = 'enrolled',
  PREMIUM = 'premium',
  INSTRUCTOR = 'instructor',
}

@Entity('course_documents')
export class CourseDocument {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'course_id' })
  courseId: number;

  @Column({ name: 'document_id' })
  documentId: number;

  @Column({ name: 'section_id', nullable: true })
  sectionId: number;

  @Column({ name: 'order_number', nullable: true })
  orderNumber: number;

  @Column({ name: 'is_required', default: false })
  isRequired: boolean;

  @Column({
    type: 'enum',
    enum: DocumentVisibility,
    default: DocumentVisibility.ENROLLED,
  })
  visibility: DocumentVisibility;

  @Column({ name: 'file_size', nullable: true })
  fileSize: number;

  @Column({ name: 'download_count', default: 0 })
  downloadCount: number;

  @Column({ name: 'is_downloadable', default: true })
  isDownloadable: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @ManyToOne(() => Document)
  @JoinColumn({ name: 'document_id' })
  document: Document;

  @ManyToOne(() => CourseSection)
  @JoinColumn({ name: 'section_id' })
  section: CourseSection;
}
