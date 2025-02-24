import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { StudyGroup } from "../studyGroups/studyGroup.schema";

export enum UserRole {
    USER = 'user',
    ADMIN = 'admin'
}

export type UserDocument = Document & User;

export interface UserEvent {
  _id: Types.ObjectId;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  type: 'homework' | 'study' | 'meeting' | 'other';
}

export interface UserTask {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  dueDate: Date;
  completed: boolean;
}

@Schema()
export class User {
    @Prop({ required: true })
    firstname: string;

    @Prop({ required: true })
    lastname: string;

    @Prop({ default: '' })
    username: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    password: string;
    
    @Prop({ default: '' })
    bio: string;

    @Prop({ default: '', type: String, maxlength: 5242880 }) // Max 5MB for base64 string
    profilePicture: string;

    @Prop({ default: '' })
    school: string;

    @Prop({ default: '' })
    major: string;

    @Prop({ default: '' })
    year: string;

    @Prop({ default: '' })
    studyPreferences: string;

    @Prop({ default: '' })
    availability: string;

    @Prop({ default: '' })
    subjects: string;

    @Prop({ default: UserRole.USER })
    role: UserRole;

    @Prop({ type: [String], default: [] })
    blacklistedTokens: string[];

    @Prop([{ type: Types.ObjectId, ref: 'Team' }])
    teams: Types.ObjectId[];

    @Prop([{ type: Types.ObjectId, ref: 'StudyGroup' }])
    studyGroups: Types.ObjectId[];

    @Prop([{
      type: {
        title: String,
        description: String,
        startDate: Date,
        endDate: Date,
        type: { type: String, enum: ['homework', 'study', 'meeting', 'other'] }
      }
    }])
    events: UserEvent[];

    @Prop([{
      type: {
        title: String,
        description: String,
        dueDate: Date,
        completed: Boolean
      }
    }])
    tasks: UserTask[];
}

export const UserSchema = SchemaFactory.createForClass(User);

