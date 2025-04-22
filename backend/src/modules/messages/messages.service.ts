import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from 'src/entities/Message';
import { Repository } from 'typeorm';
import { CreateMessageDto } from './dto/messages.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async create(
    userId: number,
    createMessageDto: CreateMessageDto,
  ): Promise<Message | null> {
    try {
      // Special handling for chatbot messages
      if (createMessageDto.receiverId === -1 || userId === -1) {
        console.log('🤖 Creating chatbot message');
        const message = this.messageRepository.create({
          senderId: userId,
          receiverId: createMessageDto.receiverId,
          messageText: createMessageDto.messageText,
          isRead: true, // Chatbot messages are always read
        });

        const savedMessage = await this.messageRepository.save(message);
        return this.messageRepository.findOne({
          where: { id: savedMessage.id },
          relations: ['sender', 'receiver'],
        });
      }

      // Regular message handling
      console.log('💬 Creating regular message');
      const message = this.messageRepository.create({
        senderId: userId,
        receiverId: createMessageDto.receiverId,
        messageText: createMessageDto.messageText,
        isRead: false,
      });

      const savedMessage = await this.messageRepository.save(message);
      return this.messageRepository.findOne({
        where: { id: savedMessage.id },
        relations: ['sender', 'receiver'],
      });
    } catch (error) {
      console.error('Error creating message:', error);
      throw new Error('Could not create message');
    }
  }

  async getConversation(userId1: number, userId2: number): Promise<Message[]> {
    return this.messageRepository.find({
      where: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 },
      ],
      order: { createdAt: 'ASC' },
      relations: ['sender', 'receiver'],
    });
  }

  async markAsRead(messageId: number): Promise<void> {
    await this.messageRepository.update(
      { id: messageId },
      {
        isRead: true,
        updatedAt: new Date(),
      },
    );
  }

  async findOne(id: number): Promise<Message | null> {
    return this.messageRepository.findOne({
      where: { id },
      relations: {
        sender: {
          userStudent: true,
          userInstructor: true,
          userStudentAcademic: {
            academicClass: true,
          },
        },
        receiver: {
          userStudent: true,
          userInstructor: true,
          userStudentAcademic: {
            academicClass: true,
          },
        },
      },
    });
  }

  async findUserMessages(userId: number) {
    return this.messageRepository.find({
      where: [
        { senderId: userId }, // Messages sent by user
        { receiverId: userId }, // Messages received by user
      ],
      relations: {
        sender: {
          userStudent: true,
          userInstructor: true,
          userStudentAcademic: {
            academicClass: true,
          },
        },
        receiver: {
          userStudent: true,
          userInstructor: true,
          userStudentAcademic: {
            academicClass: true,
          },
        },
      },
      select: {
        id: true,
        messageText: true,
        isRead: true,
        createdAt: true,
        sender: {
          id: true,
          username: true,
          email: true,
          avatarUrl: true,
          role: true,
          userStudent: {
            id: true,
            fullName: true,
            gender: true,
            educationLevel: true,
            occupation: true,
            bio: true,
          },
          userInstructor: {
            id: true,
            fullName: true,
            professionalTitle: true,
            specialization: true,
            bio: true,
            verificationStatus: true,
          },
          userStudentAcademic: {
            id: true,
            fullName: true,
            studentCode: true,
            academicYear: true,
            status: true,
            academicClass: {
              id: true,
              classCode: true,
              className: true,
            },
          },
        },
        receiver: {
          id: true,
          username: true,
          email: true,
          avatarUrl: true,
          role: true,
          userStudent: {
            id: true,
            fullName: true,
          },
          userInstructor: {
            id: true,
            fullName: true,
            professionalTitle: true,
          },
          userStudentAcademic: {
            id: true,
            fullName: true,
            studentCode: true,
            academicClass: {
              id: true,
              classCode: true,
              className: true,
            },
          },
        },
      },
    });
  }
}
