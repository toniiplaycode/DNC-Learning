import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Assignment } from './Assignment';
import { Quiz } from './Quiz';
import { UserStudentAcademic } from './UserStudentAcademic';
import { AcademicClassInstructor } from './AcademicClassInstructor';
import { AcademicClassCourse } from './AcademicClassCourse';
import { Major } from './Major';
import { Program } from './Program';

export enum AcademicClassStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('academic_classes')
export class AcademicClass {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({
    name: 'class_code',
    length: 50,
    comment: 'Mã lớp',
  })
  classCode: string;

  @Column({
    name: 'class_name',
    length: 255,
  })
  className: string;

  @Column({ name: 'major_id' })
  majorId: number;

  @Column({ name: 'program_id' })
  programId: number;

  @Column({
    length: 20,
    comment: 'Học kỳ (VD: 20231)',
  })
  semester: string;

  @Column({
    type: 'enum',
    enum: AcademicClassStatus,
    default: AcademicClassStatus.ACTIVE,
  })
  status: AcademicClassStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @OneToMany(() => Assignment, (assignment) => assignment.academicClass)
  assignments: Assignment[];

  @OneToMany(() => Quiz, (quiz) => quiz.academicClass)
  quizzes: Quiz[];

  @OneToMany(
    () => UserStudentAcademic,
    (userStudentAcademic) => userStudentAcademic.academicClass,
  )
  studentsAcademic: UserStudentAcademic[];

  @OneToMany(
    () => AcademicClassInstructor,
    (classInstructor) => classInstructor.academicClass,
  )
  instructors: AcademicClassInstructor[];

  @OneToMany(
    () => AcademicClassCourse,
    (classCourse) => classCourse.academicClass,
  )
  classCourses: AcademicClassCourse[];

  @ManyToOne(() => Major)
  @JoinColumn({ name: 'major_id' })
  major: Major;

  @ManyToOne(() => Program)
  @JoinColumn({ name: 'program_id' })
  program: Program;
}
