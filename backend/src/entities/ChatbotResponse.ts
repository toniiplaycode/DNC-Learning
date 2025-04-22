import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('chatbot_response')
export class ChatbotResponse {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'json',
    nullable: false,
  })
  keywords: string[];

  @Column('text')
  response: string;

  @Column('varchar', { length: 50 })
  category: string;

  @Column('float', { precision: 3, scale: 2 })
  confidence: number;
}
