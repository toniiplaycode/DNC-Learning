export class CreateMessageDto {
  receiverId: number;
  messageText: string;
}

// filepath: src/messages/dto/message.dto.ts
export class MessageDto {
  id: number;
  senderId: number;
  receiverId: number;
  messageText: string;
  isRead: boolean;
  createdAt: Date;
}
