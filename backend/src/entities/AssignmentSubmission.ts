import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from './User';
import { Assignment } from './Assignment';
import { UserGrade } from './UserGrade';

export enum SubmissionStatus {
  SUBMITTED = 'submitted',
  GRADED = 'graded',
  LATE = 'late',
  RESUBMIT = 'resubmit',
}

@Entity('assignment_submissions')
export class AssignmentSubmission {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'assignment_id' })
  assignmentId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column('text', { name: 'submission_text', nullable: true })
  submissionText: string | null;

  @Column({ name: 'file_url', type: 'varchar', nullable: true, length: 255 })
  fileUrl: string | null;

  @Column({
    name: 'submitted_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  submittedAt: Date;

  @Column({
    type: 'enum',
    enum: SubmissionStatus,
    default: SubmissionStatus.SUBMITTED,
  })
  status: SubmissionStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Assignment)
  @JoinColumn({ name: 'assignment_id' })
  assignment: Assignment;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => UserGrade, (userGrade) => userGrade.assignmentSubmission)
  userGrades: UserGrade[];
}
