import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  async create(createMessageDto: CreateMessageDto & { senderId: string }) {
    try {
      console.log('Creating message in service:', createMessageDto);
      
      if (!createMessageDto.senderId || !Types.ObjectId.isValid(createMessageDto.senderId)) {
        console.error('Invalid senderId:', createMessageDto.senderId);
        throw new BadRequestException('Invalid senderId');
      }

      const createdMessage = new this.messageModel({
        ...createMessageDto,
        senderId: new Types.ObjectId(createMessageDto.senderId),
      });

      const savedMessage = await createdMessage.save();
      console.log('Message saved successfully:', savedMessage);

      // Populate the sender information
      const populatedMessage = await savedMessage
        .populate('senderId', ['_id', 'username', 'firstname', 'lastname', 'profilePicture']);
      
      console.log('Message populated with sender info:', populatedMessage);
      return populatedMessage;
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  }

  async findByRoom(roomType: string, roomId: string, limit = 50) {
    try {
      console.log('Finding messages for room:', { roomType, roomId });
      const messages = await this.messageModel
        .find({ roomType, roomId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('senderId', ['_id', 'username', 'firstname', 'lastname', 'profilePicture'])
        .exec();
      
      console.log(`Found ${messages.length} messages`);
      return messages;
    } catch (error) {
      console.error('Error finding messages:', error);
      throw error;
    }
  }

  async markAsRead(messageId: string, userId: string) {
    return this.messageModel.findByIdAndUpdate(
      messageId,
      { $addToSet: { readBy: userId } },
      { new: true },
    );
  }

  async editMessage(messageId: string, content: string) {
    return this.messageModel.findByIdAndUpdate(
      messageId,
      { content, isEdited: true },
      { new: true },
    );
  }
} 