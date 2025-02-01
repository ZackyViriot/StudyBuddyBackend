import { Document, Types } from 'mongoose';
import { UserRole } from '../schemas/user.schema';

export interface User {
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
}

export type UserDocument = User & Document; 