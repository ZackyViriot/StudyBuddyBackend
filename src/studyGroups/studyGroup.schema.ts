import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { Types } from "mongoose";
import { User } from "../users/user.schema";
export type StudyGroupDocument = HydratedDocument<StudyGroup>;

type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
const VALID_DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export type MemberRole = 'admin' | 'moderator' | 'member';

export interface GroupMember {
  userId: Types.ObjectId;
  role: MemberRole;
}

@Schema()
export class StudyGroup {
   @Prop({ required: true })
   name: string;

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

   @Prop({ type: Types.ObjectId, ref: 'Chat' })
   chatId?: Types.ObjectId;
}

export const StudyGroupSchema = SchemaFactory.createForClass(StudyGroup);
