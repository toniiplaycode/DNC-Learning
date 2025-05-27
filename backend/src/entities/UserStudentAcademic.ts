import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { User } from './User';
import { SessionAttendance } from './SessionAttendance';
import { AcademicClass } from './AcademicClass';

// Enum cho trạng thái học tập
export enum StudentStatus {
  STUDYING = 'studying',
  GRADUATED = 'graduated',
  SUSPENDED = 'suspended',
  DROPPED = 'dropped',
}

@Entity('user_students_academic')
export class UserStudentAcademic {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'academic_class_id' })
  academicClassId: number;

  @Column({ name: 'student_code', length: 50, unique: true })
  studentCode: string;

  @Column({ name: 'full_name', length: 100 })
  fullName: string;

  @Column({ name: 'academic_year', length: 20 })
  academicYear: string;

  @Column({
    type: 'enum',
    enum: StudentStatus,
    default: StudentStatus.STUDYING,
  })
  status: StudentStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(
    () => AcademicClass,
    (academicClass) => academicClass.studentsAcademic,
  )
  @JoinColumn({ name: 'academic_class_id' })
  academicClass: AcademicClass;

  @OneToMany(
    () => SessionAttendance,
    (sessionAttendance) => sessionAttendance.studentAcademic,
  )
  sessionAttendances: SessionAttendance[];
}
