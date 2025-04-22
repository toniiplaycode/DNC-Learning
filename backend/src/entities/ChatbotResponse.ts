import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('chatbot_response')
export class ChatbotResponse {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', { array: true })
  keywords: string[];

  @Column('text')
  response: string;

  @Column('varchar', { length: 50 })
  category: string;

  @Column('float')
  confidence: number;
}
