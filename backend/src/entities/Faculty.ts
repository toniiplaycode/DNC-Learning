import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Major } from './Major';

export enum FacultyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('faculties')
export class Faculty {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({
    name: 'faculty_code',
    length: 50,
    unique: true,
    comment: 'Mã khoa (VD: FIT, FBA)',
  })
  facultyCode: string;

  @Column({
    name: 'faculty_name',
    length: 255,
    comment: 'Tên khoa',
  })
  facultyName: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column({
    type: 'enum',
    enum: FacultyStatus,
    default: FacultyStatus.ACTIVE,
  })
  status: FacultyStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Major, (major) => major.faculty)
  majors: Major[];
}
