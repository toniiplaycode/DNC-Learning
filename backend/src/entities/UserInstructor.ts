import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { User } from './User';
import { Course } from './Course';
import { UserGrade } from './UserGrade';

export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

@Entity('user_instructors')
export class UserInstructor {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'user_id', nullable: true })
  userId: number;

  @Column({ name: 'full_name', length: 100 })
  fullName: string;

  @Column({ name: 'professional_title', length: 100, nullable: true })
  professionalTitle: string;

  @Column({ name: 'specialization', length: 255, nullable: true })
  specialization: string;

  @Column({ name: 'education_background', type: 'text', nullable: true })
  educationBackground: string;

  @Column({ name: 'teaching_experience', type: 'text', nullable: true })
  teachingExperience: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ name: 'expertise_areas', type: 'text', nullable: true })
  expertiseAreas: string;

  @Column({ type: 'text', nullable: true })
  certificates: string;

  @Column({ name: 'linkedin_profile', length: 255, nullable: true })
  linkedinProfile: string;

  @Column({ length: 255, nullable: true })
  website: string;

  @Column({ name: 'payment_info', type: 'json', nullable: true })
  paymentInfo: any;

  @Column({
    name: 'verification_status',
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  verificationStatus: VerificationStatus;

  @Column({ name: 'verification_documents', type: 'text', nullable: true })
  verificationDocuments: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Course, (course) => course.instructor)
  courses: Course[];

  @OneToMany(() => UserGrade, (userGrade) => userGrade.instructor)
  userGrades: UserGrade[];
}
