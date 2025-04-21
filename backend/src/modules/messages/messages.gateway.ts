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

  constructor(private messagesService: MessagesService) {}

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

      // Create and save the message with full relations
      const newMessage = await this.messagesService.create(userId, payload);

      // Get receiver's socket
      const receiverSocketId = this.connectedClients.get(payload.receiverId);

      // Send to receiver if online
      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit('newMessage', newMessage);
      }

      // Send back to sender
      client.emit('messageSent', newMessage);

      return {
        event: 'messageSent',
        data: newMessage,
      };
    } catch (error) {
      console.error('Error handling message:', error);
      return {
        event: 'error',
        data: 'Could not send message',
      };
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
}
