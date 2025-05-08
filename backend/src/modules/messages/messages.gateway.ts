import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';
import { UseGuards } from '@nestjs/common';
import { CreateMessageDto } from './dto/messages.dto';
import { WsJwtAuthGuard } from 'src/guards/ws-jwt.guard';
import { ChatbotService } from '../chatbot-response/chatbot-response.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@UseGuards(WsJwtAuthGuard)
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private connectedClients = new Map<number, string>();

  constructor(
    private messagesService: MessagesService,
    private chatbotService: ChatbotService,
  ) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.auth.userId;
    if (userId) {
      this.connectedClients.set(userId, client.id);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = Array.from(this.connectedClients.entries()).find(
      ([_, socketId]) => socketId === client.id,
    )?.[0];
    if (userId) {
      this.connectedClients.delete(userId);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(client: Socket, payload: CreateMessageDto) {
    try {
      const userId = client.handshake.auth.userId;
      if (!userId) {
        throw new WsException('Unauthorized');
      }

      console.log('📨 Regular message received:', {
        from: userId,
        to: payload.receiverId,
        message: payload.messageText,
        referenceLink: payload.referenceLink,
      });

      // Validate receiverId is not chatbot
      if (payload.receiverId === -1) {
        throw new WsException('Invalid receiver ID');
      }

      // Create and save the message
      const newMessage = await this.messagesService.create(userId, payload);

      if (!newMessage) {
        throw new WsException('Failed to create message');
      }

      console.log('💾 Message created:', newMessage);

      // Send to receiver if online
      const receiverSocketId = this.connectedClients.get(payload.receiverId);
      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit('newMessage', {
          id: newMessage.id,
          messageText: newMessage.messageText,
          referenceLink: newMessage.referenceLink,
          isRead: false,
          createdAt: newMessage.createdAt,
          sender: {
            id: userId.toString(),
            username: newMessage.sender.username,
            email: newMessage.sender.email,
            role: newMessage.sender.role,
            avatarUrl: newMessage.sender.avatarUrl,
          },
          receiver: {
            id: payload.receiverId.toString(),
            username: newMessage.receiver.username,
            email: newMessage.receiver.email,
            role: newMessage.receiver.role,
            avatarUrl: newMessage.receiver.avatarUrl,
          },
        });
      }

      // Send confirmation back to sender
      client.emit('messageSent', {
        id: newMessage.id,
        messageText: newMessage.messageText,
        referenceLink: newMessage.referenceLink,
        isRead: false,
        createdAt: newMessage.createdAt,
        sender: {
          id: userId.toString(),
          username: newMessage.sender.username,
          email: newMessage.sender.email,
          role: newMessage.sender.role,
          avatarUrl: newMessage.sender.avatarUrl,
        },
        receiver: {
          id: payload.receiverId.toString(),
          username: newMessage.receiver.username,
          email: newMessage.receiver.email,
          role: newMessage.receiver.role,
          avatarUrl: newMessage.receiver.avatarUrl,
        },
      });

      return {
        event: 'messageSent',
        data: newMessage,
      };
    } catch (error) {
      console.error('❌ Error handling message:', error);
      throw new WsException({
        event: 'error',
        data: 'Could not send message',
        error: error.message,
      });
    }
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(client: Socket, messageId: number) {
    try {
      const userId = client.handshake.auth.userId;
      if (!userId) {
        throw new WsException('Unauthorized');
      }

      // Mark message as read in database
      await this.messagesService.markAsRead(messageId);

      // Get the updated message with relations
      const message = await this.messagesService.findOne(messageId);

      if (message) {
        // Notify sender that message was read
        const senderSocketId = this.connectedClients.get(message.senderId);
        if (senderSocketId) {
          this.server.to(senderSocketId).emit('messageRead', {
            messageId: messageId,
            readAt: new Date(),
          });
        }
      }

      return {
        event: 'messageRead',
        data: { messageId, success: true },
      };
    } catch (error) {
      console.error('Error marking message as read:', error);
      return {
        event: 'error',
        data: 'Could not mark message as read',
      };
    }
  }

  @SubscribeMessage('getMessages')
  async handleGetMessages(client: Socket) {
    try {
      const userId = client.handshake.auth.userId;
      if (!userId) {
        return {
          event: 'error',
          data: 'Unauthorized: User ID not found',
        };
      }

      const messages = await this.messagesService.findUserMessages(userId);

      return {
        event: 'messages',
        data: messages,
      };
    } catch (error) {
      console.error('Error fetching messages:', error);
      return {
        event: 'error',
        data: 'Không thể tải tin nhắn. Vui lòng thử lại sau.',
      };
    }
  }

  @SubscribeMessage('chatbotMessage')
  async handleChatbotMessage(
    client: Socket,
    payload: { messageText: string; referenceLink?: string },
  ) {
    const userId = client.handshake.auth.userId;

    try {
      if (!userId) {
        throw new WsException('Unauthorized');
      }

      console.log('📩 Received chatbot message:', {
        userId,
        message: payload.messageText,
        referenceLink: payload.referenceLink,
      });

      // Create user's message
      const message = await this.messagesService.create(userId, {
        receiverId: -1,
        messageText: payload.messageText,
        referenceLink: payload.referenceLink,
      });

      if (!message) {
        throw new Error('Failed to create user message');
      }

      // Emit user's message immediately
      client.emit('newMessage', {
        id: message.id,
        messageText: message.messageText,
        referenceLink: message.referenceLink,
        isRead: true,
        createdAt: message.createdAt,
        sender: {
          id: userId.toString(),
          username: message.sender.username,
          email: message.sender.email,
          role: message.sender.role,
          avatarUrl: message.sender.avatarUrl,
        },
        receiver: {
          id: '-1',
          username: 'DNC Assistant',
          avatarUrl: '/chatbot-avatar.png',
          role: 'chatbot',
        },
      });

      // Get chatbot response
      const botResponse = await this.chatbotService.processMessage(message);
      console.log('🤖 Bot response:', botResponse);

      // Add delay before sending bot response
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (botResponse) {
        client.emit('newMessage', {
          id: botResponse.id,
          messageText: botResponse.messageText,
          isRead: true,
          createdAt: new Date().toISOString(), // Use current time after delay
          sender: {
            id: '-1',
            username: 'DNC Assistant',
            avatarUrl: '/chatbot-avatar.png',
            role: 'chatbot',
          },
          receiver: {
            id: userId.toString(),
          },
        });
      }
    } catch (error) {
      console.error('❌ Chatbot error:', error);

      // Add delay before error response
      await new Promise((resolve) => setTimeout(resolve, 1500));

      client.emit('newMessage', {
        id: Date.now(),
        messageText: 'Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau.',
        isRead: true,
        createdAt: new Date().toISOString(),
        sender: {
          id: '-1',
          username: 'DNC Assistant',
          avatarUrl: '/chatbot-avatar.png',
          role: 'chatbot',
        },
        receiver: {
          id: userId?.toString() || '0',
        },
      });
    }
  }
}
