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
import { UserGrade } from './UserGrade';
import { CourseSection } from './CourseSection';
import { Assignment } from './Assignment';
import { Quiz } from './Quiz';
import { CourseProgress } from './CourseProgress';
import { CourseLessonDiscussion } from './CourseLessonDiscussion';

export enum ContentType {
  VIDEO = 'video',
  SLIDE = 'slide',
  TXT = 'txt',
  DOCX = 'docx',
  PDF = 'pdf',
  XLSX = 'xlsx',
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

  @OneToMany(() => UserGrade, (userGrade) => userGrade.lesson)
  userGrades: UserGrade[];

  @OneToMany(() => Assignment, (assignment) => assignment.lesson)
  assignments: Assignment[];

  @OneToMany(() => Quiz, (quiz) => quiz.lesson)
  quizzes: Quiz[];

  @OneToMany(() => CourseProgress, (progress) => progress.lesson)
  progress: CourseProgress[];

  @OneToMany(() => CourseLessonDiscussion, (discussion) => discussion.lesson)
  discussions: CourseLessonDiscussion[];
}
