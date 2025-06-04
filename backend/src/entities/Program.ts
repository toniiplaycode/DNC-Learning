import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Major } from './Major';
import { ProgramCourse } from './ProgramCourse';
import { AcademicClass } from './AcademicClass';

export enum ProgramStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('programs')
export class Program {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'major_id' })
  majorId: number;

  @Column({
    name: 'program_code',
    length: 50,
    unique: true,
    comment: 'Mã chương trình (VD: BSIT2023)',
  })
  programCode: string;

  @Column({
    name: 'program_name',
    length: 255,
    comment: 'Tên chương trình',
  })
  programName: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column({
    name: 'total_credits',
    type: 'int',
    comment: 'Tổng số tín chỉ',
  })
  totalCredits: number;

  @Column({
    name: 'duration_years',
    type: 'int',
    comment: 'Thời gian đào tạo (năm)',
  })
  durationYears: number;

  @Column({
    type: 'enum',
    enum: ProgramStatus,
    default: ProgramStatus.ACTIVE,
  })
  status: ProgramStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Major)
  @JoinColumn({ name: 'major_id' })
  major: Major;

  @OneToMany(() => ProgramCourse, (programCourse) => programCourse.program)
  programCourses: ProgramCourse[];

  @OneToMany(() => AcademicClass, (academicClass) => academicClass.program)
  academicClasses: AcademicClass[];
}
