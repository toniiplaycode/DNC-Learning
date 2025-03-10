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
import { User } from './User';
import { Category } from './Category';
import { CourseSection } from './CourseSection';
import { CourseDocument } from './CourseDocument';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ length: 255, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'category_id', nullable: true })
  categoryId: number;

  @Column({ name: 'instructor_id', nullable: true })
  instructorId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ nullable: true, comment: 'Duration in minutes' })
  duration: number;

  @Column({
    type: 'enum',
    enum: ['beginner', 'intermediate', 'advanced'],
    nullable: true,
  })
  level: 'beginner' | 'intermediate' | 'advanced';

  @Column({
    type: 'enum',
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  })
  status: 'draft' | 'published' | 'archived';

  @Column({ length: 255, nullable: true, name: 'thumbnail_url' })
  thumbnailUrl: string;

  @Column({ type: 'date', nullable: true, name: 'start_date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true, name: 'end_date' })
  endDate: Date;

  @Column({ nullable: true, name: 'enrollment_limit' })
  enrollmentLimit: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'instructor_id' })
  instructor: User;

  @OneToMany(() => CourseSection, (section) => section.course)
  sections: CourseSection[];

  @OneToMany(() => CourseDocument, (document) => document.course)
  documents: CourseDocument[];
}
