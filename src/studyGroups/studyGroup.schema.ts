import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { User } from "../users/user.schema";

export type StudyGroupDocument = HydratedDocument<StudyGroup>;

type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
const VALID_DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export type MemberRole = 'admin' | 'moderator' | 'member';

export interface GroupMember {
  userId: Types.ObjectId;
  role: MemberRole;
}

export interface StudyGroupMeeting {
    _id: Types.ObjectId;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    location?: string;
    createdBy: Types.ObjectId;
}

@Schema({ timestamps: true })
export class StudyGroupMeeting {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: false })
  location?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
}

@Schema({ timestamps: true })
export class StudyGroupTask {
  @Prop({ type: Types.ObjectId, required: true, default: () => new Types.ObjectId() })
  _id: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  dueDate: Date;

  @Prop({ enum: ['pending', 'in_progress', 'completed'], default: 'pending' })
  status: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  assignedTo: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
}

@Schema()
export class StudyGroup {
   @Prop({ required: true })
   name: string;

   @Prop({ required: true })
   description: string;

   @Prop({ required: true, enum: ['online', 'in-person', 'hybrid'] })
   meetingType: string;

   @Prop({
     required: true,
     type: [String],
     validate: {
       validator: function(v: string[]) {
         return v.every(day => VALID_DAYS.includes(day as DayOfWeek));
       },
       message: 'Meeting days must be valid days of the week'
     }
   })
   meetingDays: DayOfWeek[];

   @Prop({ required: true })
   meetingLocation: string;

   @Prop()
   meetingTime: string;

   @Prop({ required: true })
   startTime: string;

   @Prop({ required: true })
   endTime: string;

   @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
   createdBy: Types.ObjectId;

   @Prop({
     required: true,
     type: [{
       userId: { type: Types.ObjectId, ref: 'User', required: true },
       role: { type: String, enum: ['admin', 'moderator', 'member'], required: true }
     }],
     default: []
   })
   members: GroupMember[];

   @Prop({ type: [StudyGroupMeeting], default: [] })
   meetings: StudyGroupMeeting[];

   @Prop({ type: [StudyGroupTask], default: [] })
   tasks: StudyGroupTask[];

   @Prop({ type: Types.ObjectId, ref: 'Chat' })
   chatId?: Types.ObjectId;

   @Prop({ unique: true, default: () => Math.random().toString(36).substring(2, 8).toUpperCase() })
   joinCode?: string;

   @Prop()
   subject: string;

   @Prop()
   course: string;

   @Prop()
   institution: string;
}

export const StudyGroupSchema = SchemaFactory.createForClass(StudyGroup);
