import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';


@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}


  @Get('messages/:studyGroupId')
  async getMessages(@Param('studyGroupId') studyGroupId: string) {
    return this.chatService.getMessagesByStudyGroup(studyGroupId);
  }
}