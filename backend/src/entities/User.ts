import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { UserStudent } from './UserStudent';
import { UserInstructor } from './UserInstructor';
import { Certificate } from './Certificate';
import { UserGrade } from './UserGrade';
import { CourseProgress } from './CourseProgress';
import { CourseLessonDiscussion } from './CourseLessonDiscussion';
import { UserStudentAcademic } from './UserStudentAcademic';
import { Enrollment } from './Enrollment';
import { Message } from './Message';

// Tạo enum cho role
export enum UserRole {
  STUDENT = 'student',
  STUDENT_ACADEMIC = 'student_academic',
  INSTRUCTOR = 'instructor',
  ADMIN = 'admin',
}

// Tạo enum cho status
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned',
}

@Entity('users') // tên bảng trong database
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ length: 50, unique: true })
  username: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 15, unique: true, nullable: true })
  phone: string;

  @Column({ length: 255, name: 'password' })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STUDENT,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({ length: 255, nullable: true, name: 'avatar_url' })
  avatarUrl: string;

  @Column({ default: false, name: 'two_factor_enabled' })
  twoFactorEnabled: boolean;

  @Column({ length: 100, nullable: true, name: 'two_factor_secret' })
  twoFactorSecret: string;

  @Column({ length: 50, nullable: true, name: 'social_login_provider' })
  socialLoginProvider: string;

  @Column({ length: 'text', nullable: true, name: 'social_login_id' })
  socialLoginId: string;

  @Column({ nullable: true, name: 'last_login' })
  lastLogin: Date;

  @Column({ nullable: true, name: 'refresh_token' })
  refreshToken: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => UserStudent, (userStudent) => userStudent.user)
  userStudent: UserStudent;

  @OneToOne(
    () => UserStudentAcademic,
    (userStudentAcademic) => userStudentAcademic.user,
  )
  userStudentAcademic: UserStudentAcademic;

  @OneToOne(() => UserInstructor, (userInstructor) => userInstructor.user)
  userInstructor: UserInstructor;

  @OneToMany(() => Certificate, (certificate) => certificate.user)
  certificates: Certificate[];

  @OneToMany(() => UserGrade, (userGrade) => userGrade.user)
  userGrades: UserGrade[];

  @OneToMany(() => CourseProgress, (progress) => progress.user)
  courseProgress: CourseProgress[];

  @OneToMany(() => CourseLessonDiscussion, (discussion) => discussion.user)
  lessonDiscussions: CourseLessonDiscussion[];

  @OneToMany(() => Enrollment, (enrollment) => enrollment.user)
  enrollments: Enrollment[];

  @OneToMany(() => Message, (message) => message.sender)
  sentMessages: Message[];

  @OneToMany(() => Message, (message) => message.receiver)
  receivedMessages: Message[];
}
