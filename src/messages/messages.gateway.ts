import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessagesService } from './messages.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'https://study-buddy-frontend-git-main-zackyviriots-projects.vercel.app'],
    credentials: true,
  },
  namespace: '/',
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  path: '/socket.io/',
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    console.log('WebSocket Gateway initialized');
  }

  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    try {
      console.log('New socket connection attempt', {
        headers: client.handshake.headers,
        query: client.handshake.query,
      });

      const token = client.handshake.auth?.token || 
                    client.handshake.headers?.authorization?.replace('Bearer ', '') ||
                    client.handshake.query?.token;

      if (!token) {
        console.log('No token provided in socket connection');
        throw new UnauthorizedException('No token provided');
      }

      const jwtSecret = this.configService.get('JWT_SECRET');
      console.log('Verifying token with secret:', jwtSecret?.substring(0, 5) + '...');
      
      const payload = await this.jwtService.verify(token, {
        secret: jwtSecret,
      });
      
      client.data = { user: { id: payload.sub } };
      console.log('Socket authenticated for user:', payload.sub);
      
      // Send a connection acknowledgment
      client.emit('connected', { userId: payload.sub });
      return true;
    } catch (error) {
      console.error('Socket authentication failed:', error.message);
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect();
      return false;
    }
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id, client.data?.user?.id);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; roomType: string },
  ) {
    console.log('Join room attempt:', { userId: client.data?.user?.id, ...data });
    if (!client.data?.user) {
      console.log('Join room failed: Not authenticated');
      throw new UnauthorizedException('Not authenticated');
    }

    const room = `${data.roomType}-${data.roomId}`;
    await client.join(room);
    console.log(`User ${client.data.user.id} joined room ${room}`);
    return { success: true };
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; roomType: string },
  ) {
    console.log('Leave room attempt:', { userId: client.data?.user?.id, ...data });
    if (!client.data?.user) {
      console.log('Leave room failed: Not authenticated');
      throw new UnauthorizedException('Not authenticated');
    }

    const room = `${data.roomType}-${data.roomId}`;
    await client.leave(room);
    console.log(`User ${client.data.user.id} left room ${room}`);
    return { success: true };
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() createMessageDto: CreateMessageDto,
  ) {
    console.log('Send message attempt:', { 
      userId: client.data?.user?.id,
      socketId: client.id,
      ...createMessageDto 
    });

    if (!client.data?.user) {
      console.log('Send message failed: Not authenticated');
      throw new UnauthorizedException('Not authenticated');
    }

    try {
      console.log('Creating message in database:', { 
        ...createMessageDto, 
        senderId: client.data.user.id 
      });

      const message = await this.messagesService.create({
        ...createMessageDto,
        senderId: client.data.user.id,
      });

      console.log('Message saved successfully:', message);

      const room = `${createMessageDto.roomType}-${createMessageDto.roomId}`;
      console.log('Broadcasting to room:', room);
      
      this.server.to(room).emit('newMessage', message);
      console.log('Message broadcast complete');
      
      return { success: true, message };
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; roomType: string; isTyping: boolean },
  ) {
    console.log('Typing status update:', { userId: client.data?.user?.id, ...data });
    if (!client.data?.user) {
      console.log('Typing update failed: Not authenticated');
      throw new UnauthorizedException('Not authenticated');
    }

    const room = `${data.roomType}-${data.roomId}`;
    this.server.to(room).emit('userTyping', {
      userId: client.data.user.id,
      isTyping: data.isTyping,
    });
    return { success: true };
  }
} 