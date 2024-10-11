import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ namespace: 'chat' })
export class ChatGateway {
  @WebSocketServer() server: Server;

  constructor(private chatService: ChatService) {}

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() data: { studyGroupId: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`Client ${client.id} joining room ${data.studyGroupId}`);
    client.join(data.studyGroupId);
    return { success: true, message: 'Joined room successfully' };
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() data: { studyGroupId: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`Client ${client.id} leaving room ${data.studyGroupId}`);
    client.leave(data.studyGroupId);
    return { success: true, message: 'Left room successfully' };
  }

  @SubscribeMessage('chatToServer')
  async handleMessage(
    @MessageBody() payload: { userId: string; studyGroupId: string; content: string; username: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      console.log(`Received message from user ${payload.userId} in group ${payload.studyGroupId}`);
      const message = await this.chatService.createMessage(
        payload.userId,
        payload.studyGroupId,
        payload.content,
      );

      // Ensure the sender's socket is in the room
      if (!client.rooms.has(payload.studyGroupId)) {
        console.log(`Client ${client.id} not in room ${payload.studyGroupId}, joining now`);
        client.join(payload.studyGroupId);
      }

      console.log(`Broadcasting message to room ${payload.studyGroupId}`);
      this.server.to(payload.studyGroupId).emit('chatToClient', {
        ...message,
        username: payload.username,
        createdAt: new Date().toISOString() // Ensure we're sending an ISO string
      });

      return { success: true, message: 'Message sent successfully' };
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, message: 'Failed to send message' };
    }
  }
}