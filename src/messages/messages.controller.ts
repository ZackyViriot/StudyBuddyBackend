import { Controller, Get, Query, UseGuards, BadRequestException, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getMessages(
    @Query('roomId') roomId: string,
    @Query('roomType') roomType: string,
    @Req() req: any
  ) {
    console.log('Getting messages for room:', { roomId, roomType });
    console.log('User from token:', req.user);

    if (!roomId) {
      throw new BadRequestException('roomId is required');
    }

    if (!roomType || !['team', 'study-group'].includes(roomType)) {
      throw new BadRequestException('roomType must be either "team" or "study-group"');
    }

    try {
      const messages = await this.messagesService.findByRoom(roomType, roomId);
      console.log(`Found ${messages.length} messages`);
      return messages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw new BadRequestException('Failed to fetch messages');
    }
  }
} 