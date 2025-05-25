import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GroupMessagesService } from './group-messages.service';
import { GroupMessage } from '../../entities/GroupMessage';
import { UsersService } from '../users/users.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class GroupMessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(GroupMessagesGateway.name);
  private connectedClients = new Map<number, string>();
  private classRooms = new Map<string, Set<string>>();

  constructor(
    private groupMessagesService: GroupMessagesService,
    private usersService: UsersService,
  ) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.auth.userId;
    if (userId) {
      this.connectedClients.set(userId, client.id);
      this.logger.log(`Client connected: ${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = Array.from(this.connectedClients.entries()).find(
      ([_, socketId]) => socketId === client.id,
    )?.[0];

    if (userId) {
      this.connectedClients.delete(userId);
      this.logger.log(`Client disconnected: ${userId}`);

      // Remove user from all class rooms
      this.classRooms.forEach((users, classId) => {
        if (users.has(userId.toString())) {
          users.delete(userId.toString());
          this.server.to(classId).emit('userLeft', { userId, classId });
        }
      });
    }
  }

  @SubscribeMessage('joinClassRoom')
  async handleJoinClassRoom(
    @MessageBody() data: { classId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.handshake.auth.userId;
    if (!userId) return;

    const { classId } = data;
    this.logger.log(`User ${userId} joining class room ${classId}`);

    // Add user to room
    if (!this.classRooms.has(classId)) {
      this.classRooms.set(classId, new Set());
    }
    this.classRooms.get(classId)?.add(userId.toString());

    // Join socket room
    await client.join(classId);

    // Notify others in the room
    this.server.to(classId).emit('userJoined', { userId, classId });

    // Send current users in room to the new user
    const usersInRoom = Array.from(this.classRooms.get(classId) || []);
    client.emit('roomUsers', { classId, users: usersInRoom });

    return { success: true, classId, userId };
  }

  @SubscribeMessage('leaveClassRoom')
  async handleLeaveClassRoom(
    @MessageBody() data: { classId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.handshake.auth.userId;
    if (!userId) return;

    const { classId } = data;
    this.logger.log(`User ${userId} leaving class room ${classId}`);

    // Remove user from room
    this.classRooms.get(classId)?.delete(userId.toString());

    // Leave socket room
    await client.leave(classId);

    // Notify others in the room
    this.server.to(classId).emit('userLeft', { userId, classId });

    return { success: true, classId, userId };
  }

  @SubscribeMessage('sendGroupMessage')
  async handleSendGroupMessage(
    @MessageBody() data: Partial<GroupMessage>,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.handshake.auth.userId;
    if (!userId) return;

    try {
      const message = await this.groupMessagesService.sendGroupMessage(data);
      this.logger.log(
        `New group message in class ${message.classId}: ${message.messageText}`,
      );

      // Emit to all users in the class room
      this.server
        .to(message.classId.toString())
        .emit('newGroupMessage', message);

      return message;
    } catch (error) {
      this.logger.error('Error sending group message:', error);
      client.emit('error', { message: 'Failed to send message' });
      return null;
    }
  }
}
