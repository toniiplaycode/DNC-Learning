import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

@Entity('user_students')
export class UserStudent {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'full_name', length: 100 })
  fullName: string;

  @Column({ nullable: true, type: 'date', name: 'date_of_birth' })
  dateOfBirth: Date;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender: Gender;

  @Column({ name: 'education_level', length: 100, nullable: true })
  educationLevel: string;

  @Column({ length: 100, nullable: true })
  occupation: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'text', nullable: true })
  interests: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 100, nullable: true })
  country: string;

  @Column({ type: 'text', nullable: true, name: 'learning_goals' })
  learningGoals: string;

  @Column({ name: 'preferred_language', length: 50, nullable: true })
  preferredLanguage: string;

  @Column({ name: 'notification_preferences', type: 'json', nullable: true })
  notificationPreferences: any;

  @Column({ name: 'total_courses_enrolled', default: 0 })
  totalCoursesEnrolled: number;

  @Column({ name: 'total_courses_completed', default: 0 })
  totalCoursesCompleted: number;

  @Column({ name: 'achievement_points', default: 0 })
  achievementPoints: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
