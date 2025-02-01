import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { User, UserDocument, UserRole } from '../users/schemas/user.schema';
import { Types } from 'mongoose';
import { AuthResponse } from './auth.controller';

interface JwtPayload {
    sub: string;
    email: string;
}

export interface UserResponse {
    _id: string;
    email: string;
    firstname: string;
    lastname: string;
    username?: string;
    profilePicture?: string;
    bio?: string;
    major?: string;
    school?: string;
    year?: string;
    role: UserRole;
    preferences?: {
        studyPreferences: string[];
        subjects: string[];
        availability: string[];
    };
}

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) {}

    private toUserResponse(user: UserDocument): UserResponse {
        const response: UserResponse = {
            _id: user._id.toString(),
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            role: user.role
        };

        // Add optional fields only if they have values
        if (user.username && user.username.trim()) {
            response.username = user.username;
        }
        if (user.profilePicture && user.profilePicture.trim()) {
            response.profilePicture = user.profilePicture;
        }
        if (user.bio && user.bio.trim()) {
            response.bio = user.bio;
        }
        if (user.major && user.major.trim()) {
            response.major = user.major;
        }
        if (user.school && user.school.trim()) {
            response.school = user.school;
        }
        if (user.year && user.year.trim()) {
            response.year = user.year;
        }

        // Add preferences only if any of the fields have values
        const studyPreferences = user.studyPreferences ? user.studyPreferences.split(',').map(p => p.trim()).filter(Boolean) : [];
        const subjects = user.subjects ? user.subjects.split(',').map(s => s.trim()).filter(Boolean) : [];
        const availability = user.availability ? user.availability.split(',').map(a => a.trim()).filter(Boolean) : [];

        if (studyPreferences.length > 0 || subjects.length > 0 || availability.length > 0) {
            response.preferences = {
                studyPreferences,
                subjects,
                availability
            };
        }

        return response;
    }

    async validateUser(email: string, password: string): Promise<UserDocument | null> {
        const user = await this.usersService.findByEmail(email);
        if (!user) return null;

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) return null;

        return user as UserDocument;
    }

    async login(user: UserDocument): Promise<AuthResponse> {
        return this.generateToken(user);
    }

    async logout(userId: string, token: string) {
        const user = await this.usersService.findById(userId, true);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const userDoc = user as UserDocument;
        userDoc.blacklistedTokens = userDoc.blacklistedTokens || [];
        userDoc.blacklistedTokens.push(token);
        await userDoc.save();
        return { message: 'Logged out successfully' };
    }

    async validateToken(token: string): Promise<boolean> {
        try {
            const payload = this.jwtService.verify(token) as JwtPayload;
            if (!Types.ObjectId.isValid(payload.sub)) return false;

            const user = await this.usersService.findById(payload.sub, true);
            if (!user) return false;

            const userDoc = user as UserDocument;
            return !userDoc.blacklistedTokens?.includes(token);
        } catch (error) {
            return false;
        }
    }

    async generateToken(user: UserDocument): Promise<AuthResponse> {
        const payload: JwtPayload = { email: user.email, sub: user._id.toString() };
        return {
            access_token: this.jwtService.sign(payload),
            user: this.toUserResponse(user)
        };
    }
} 