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
import { Faculty } from './Faculty';
import { Program } from './Program';
import { AcademicClass } from './AcademicClass';

export enum MajorStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('majors')
export class Major {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'faculty_id' })
  facultyId: number;

  @Column({
    name: 'major_code',
    length: 50,
    unique: true,
    comment: 'Mã ngành (VD: SE, CS)',
  })
  majorCode: string;

  @Column({
    name: 'major_name',
    length: 255,
    comment: 'Tên ngành',
  })
  majorName: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column({
    type: 'enum',
    enum: MajorStatus,
    default: MajorStatus.ACTIVE,
  })
  status: MajorStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Faculty)
  @JoinColumn({ name: 'faculty_id' })
  faculty: Faculty;

  @OneToMany(() => Program, (program) => program.major)
  programs: Program[];

  @OneToMany(() => AcademicClass, (academicClass) => academicClass.major)
  academicClasses: AcademicClass[];
}
