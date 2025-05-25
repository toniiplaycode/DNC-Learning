import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';
import { AcademicClass } from './AcademicClass';

@Entity('group_messages')
export class GroupMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'sender_id' })
  senderId: number;

  @Column({ name: 'class_id' })
  classId: number;

  @Column({ type: 'text', name: 'message_text' })
  messageText: string;

  @Column({ type: 'text', name: 'reference_link', nullable: true })
  referenceLink: string;

  @Column({ name: 'reply_to_id', nullable: true })
  replyToId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(() => AcademicClass, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'class_id' })
  academicClass: AcademicClass;

  @ManyToOne(() => GroupMessage, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reply_to_id' })
  replyTo: GroupMessage;
}
