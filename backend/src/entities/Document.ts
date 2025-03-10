import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';

export enum DocumentStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'file_url', length: 255 })
  fileUrl: string;

  @Column({ name: 'file_type', length: 50 })
  fileType: string;

  @Column({ name: 'file_size', nullable: true })
  fileSize: number;

  @Column({
    name: 'upload_date',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  uploadDate: Date;

  @Column({ name: 'author_id' })
  authorId: number;

  @Column({ name: 'download_count', default: 0 })
  downloadCount: number;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.ACTIVE,
  })
  status: DocumentStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'author_id' })
  author: User;
}
