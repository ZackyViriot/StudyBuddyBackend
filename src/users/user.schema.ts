import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export enum UserRole {
    USER = 'user',
    ADMIN = 'admin'
}

@Schema()
export class User {
    @Prop({ required: true })
    firstName: string;

    @Prop({ required: true })
    lastName: string;

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
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);

