import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatMessage,ChatMessageDocument } from './chatMessage.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatMessage.name) private chatMessageModel: Model<ChatMessageDocument>,
  ) {}

  async createMessage(userId: string, studyGroupId: string, content: string): Promise<ChatMessage> {
    const newMessage = new this.chatMessageModel({ userId, studyGroupId, content });
    return newMessage.save();
  }

  async getMessagesByStudyGroup(studyGroupId: string): Promise<ChatMessage[]> {
    return this.chatMessageModel.find({ studyGroupId }).sort({ createdAt: 1 }).exec();
  }
}