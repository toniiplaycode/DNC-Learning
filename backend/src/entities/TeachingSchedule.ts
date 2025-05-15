import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { AcademicClass } from './AcademicClass';
import { AcademicClassCourse } from './AcademicClassCourse';
import { Notification } from './Notification';
import { AcademicClassInstructor } from './AcademicClassInstructor';

export enum ScheduleStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('teaching_schedules')
export class TeachingSchedule {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'academic_class_id' })
  academicClassId: number;

  @Column({ name: 'academic_class_instructor_id' })
  academicClassInstructorId: number;

  @Column({ name: 'academic_class_course_id', nullable: true })
  academicClassCourseId: number;

  @Column({ name: 'title', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'start_time', type: 'datetime' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'datetime' })
  endTime: Date;

  @Column({ name: 'meeting_link', length: 255, nullable: true })
  meetingLink: string;

  @Column({ name: 'meeting_id', length: 100, nullable: true })
  meetingId: string;

  @Column({ name: 'meeting_password', length: 100, nullable: true })
  meetingPassword: string;

  @Column({
    type: 'enum',
    enum: ScheduleStatus,
    default: ScheduleStatus.SCHEDULED,
  })
  status: ScheduleStatus;

  @Column({ name: 'is_recurring', default: false })
  isRecurring: boolean;

  @Column({ name: 'recurring_pattern', type: 'json', nullable: true })
  recurringPattern: any;

  @Column({ name: 'recording_url', type: 'text', nullable: true })
  recordingUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => AcademicClass)
  @JoinColumn({ name: 'academic_class_id' })
  academicClass: AcademicClass;

  @ManyToOne(() => AcademicClassInstructor)
  @JoinColumn({ name: 'academic_class_instructor_id' })
  academicClassInstructor: AcademicClassInstructor;

  @ManyToOne(() => AcademicClassCourse, { nullable: true })
  @JoinColumn({ name: 'academic_class_course_id' })
  academicClassCourse: AcademicClassCourse;

  @OneToOne(() => Notification, (notification) => notification.teachingSchedule)
  notification: Notification;
}
