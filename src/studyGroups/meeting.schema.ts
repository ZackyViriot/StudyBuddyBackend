import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MeetingDocument = Meeting & Document;

@Schema()
export class Meeting {
  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  date: string;

  @Prop({ required: true })
  startTime: string;

  @Prop({ required: true })
  endTime: string;

  @Prop({ required: true, enum: ['online', 'in-person', 'hybrid'] })
  meetingType: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'StudyGroup' })
  studyGroupId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const MeetingSchema = SchemaFactory.createForClass(Meeting); 