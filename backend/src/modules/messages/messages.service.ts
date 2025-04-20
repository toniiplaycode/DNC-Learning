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
    senderId: number,
    createMessageDto: CreateMessageDto,
  ): Promise<Message | null> {
    const message = this.messageRepository.create({
      senderId,
      receiverId: createMessageDto.receiverId,
      messageText: createMessageDto.messageText,
    });

    const savedMessage = await this.messageRepository.save(message);

    // Fetch complete message with relations after saving
    return this.messageRepository.findOne({
      where: { id: savedMessage.id },
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
    await this.messageRepository.update(messageId, { isRead: true });
  }

  async findOne(id: number) {
    return this.messageRepository.findOne({ where: { id } });
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
