import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum UserRole {
    USER = 'user',
    ADMIN = 'admin'
}

export interface UserPreferences {
    studyPreferences: string[];
    subjects: string[];
    availability: string[];
}

@Schema()
export class User {
    _id: Types.ObjectId;

    @Prop({ required: true })
    firstname: string;

    @Prop({ required: true })
    lastname: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ default: '' })
    username: string;

    @Prop({ default: '' })
    profilePicture: string;

    @Prop({ default: '' })
    bio: string;

    @Prop({ default: '' })
    major: string;

    @Prop({ default: '' })
    school: string;

    @Prop({ default: '' })
    year: string;

    @Prop({ type: String, enum: UserRole, default: UserRole.USER })
    role: UserRole;

    @Prop({ default: '' })
    studyPreferences: string;

    @Prop({ default: '' })
    subjects: string;

    @Prop({ default: '' })
    availability: string;

    @Prop({ type: [String], default: [] })
    blacklistedTokens: string[];
}

export type UserDocument = Document & {
    _id: Types.ObjectId;
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    username: string;
    profilePicture: string;
    bio: string;
    major: string;
    school: string;
    year: string;
    role: UserRole;
    studyPreferences: string;
    subjects: string;
    availability: string;
    blacklistedTokens: string[];
    save(): Promise<UserDocument>;
    toObject(): any;
};

export const UserSchema = SchemaFactory.createForClass(User); 