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
import { TeachingSchedule } from './TeachingSchedule';
import { User } from './User';
import { UserStudentAcademic } from './UserStudentAcademic';

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused',
}

@Entity('session_attendances')
export class SessionAttendance {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'schedule_id' })
  scheduleId: number;

  @Column({ name: 'student_academic_id' })
  studentAcademicId: number;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.ABSENT,
  })
  status: AttendanceStatus;

  @Column({ name: 'join_time', type: 'datetime', nullable: true })
  joinTime: Date;

  @Column({ name: 'leave_time', type: 'datetime', nullable: true })
  leaveTime: Date;

  @Column({ name: 'duration_minutes', type: 'int', nullable: true })
  durationMinutes: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => TeachingSchedule)
  @JoinColumn({ name: 'schedule_id' })
  teachingSchedule: TeachingSchedule;

  @ManyToOne(() => UserStudentAcademic)
  @JoinColumn({ name: 'student_academic_id' })
  studentAcademic: UserStudentAcademic;
}
