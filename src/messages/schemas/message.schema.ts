import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({ required: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  senderId: Types.ObjectId;

  @Prop({ required: true })
  roomId: string;

  @Prop({ required: true, enum: ['team', 'study-group'] })
  roomType: string;

  @Prop({ default: false })
  isEdited: boolean;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  readBy: Types.ObjectId[];

  @Prop({ type: [String], default: [] })
  attachments: string[];

  // Add createdAt and updatedAt
  createdAt?: Date;
  updatedAt?: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message); 