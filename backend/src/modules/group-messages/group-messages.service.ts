import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupMessage } from '../../entities/GroupMessage';
import { AcademicClass } from '../../entities/AcademicClass';

@Injectable()
export class GroupMessagesService {
  constructor(
    @InjectRepository(GroupMessage)
    private groupMessageRepository: Repository<GroupMessage>,
    @InjectRepository(AcademicClass)
    private academicClassRepository: Repository<AcademicClass>,
  ) {}

  async sendGroupMessage(data: Partial<GroupMessage>): Promise<GroupMessage> {
    const message = this.groupMessageRepository.create(data);
    return this.groupMessageRepository.save(message);
  }

  async getMessagesByClass(
    classId: number,
  ): Promise<{ messages: GroupMessage[]; academicClass: AcademicClass }> {
    // Lấy thông tin lớp học một lần
    const academicClass = await this.academicClassRepository.findOne({
      where: { id: classId },
    });

    if (!academicClass) {
      throw new NotFoundException(
        `Academic class with ID ${classId} not found`,
      );
    }

    // Lấy danh sách tin nhắn không bao gồm academicClass
    const messages = await this.groupMessageRepository.find({
      where: { classId },
      order: { createdAt: 'ASC' },
      relations: [
        'sender',
        'sender.userStudentAcademic',
        'sender.userInstructor',
        'replyTo',
      ],
    });

    return {
      messages,
      academicClass,
    };
  }

  async getMessageById(id: number): Promise<GroupMessage | null> {
    return this.groupMessageRepository.findOne({
      where: { id },
      relations: ['sender', 'replyTo'],
    });
  }
}
