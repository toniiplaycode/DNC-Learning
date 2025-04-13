import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AcademicClass } from './AcademicClass';
import { UserInstructor } from './UserInstructor';

@Entity('academic_class_instructors')
export class AcademicClassInstructor {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'class_id' })
  classId: number;

  @Column({ name: 'instructor_id' })
  instructorId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => AcademicClass, (academicClass) => academicClass.instructors)
  @JoinColumn({ name: 'class_id' })
  academicClass: AcademicClass;

  @ManyToOne(
    () => UserInstructor,
    (userInstructor) => userInstructor.academicClasses,
  )
  @JoinColumn({ name: 'instructor_id' })
  instructor: UserInstructor;
}
