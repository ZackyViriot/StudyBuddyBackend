import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { Types } from "mongoose";
import { StudyGroup } from "../studyGroups/studyGroup.schema";

export enum UserRole {
    USER = 'user',
    ADMIN = 'admin'
}

@Schema()
export class User {
    @Prop({ required: true })
    firstname: string;

    @Prop({ required: true })
    lastname: string;

    @Prop({ default: '' })
    username: string;

    @Prop({ required: true })
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

    @Prop({ default: UserRole.USER })
    role: UserRole;

    @Prop({ type: [String], default: [] })
    blacklistedTokens: string[];

    @Prop({ type: [{ type: Types.ObjectId, ref: 'StudyGroup' }], default: [] })
    studyGroups: Types.ObjectId[];
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);

