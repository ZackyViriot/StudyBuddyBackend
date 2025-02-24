import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../users/schemas/user.schema';

export enum EventType {
  HOMEWORK = 'homework',
  STUDY = 'study',
  MEETING = 'meeting',
  OTHER = 'other'
}

@Schema({ timestamps: true })
export class Event extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({
    type: String,
    enum: EventType,
    default: EventType.OTHER
  })
  type: EventType;

  @Prop({ type: String })
  customType: string;

  @Prop()
  location: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  owner: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Team' })
  teamId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'StudyGroup' })
  studyGroupId: string;

  @Prop({ type: Boolean, default: false })
  completed: boolean;

  @Prop({ type: Boolean, default: false })
  cleared: boolean;

  @Prop({ type: String, default: 'personal' })
  source: string;
}

export const EventSchema = SchemaFactory.createForClass(Event); 