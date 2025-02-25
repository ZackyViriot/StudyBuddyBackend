// Import necessary decorators and utilities from NestJS
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
// Mongoose-specific decorator for dependency injection
import { InjectModel } from '@nestjs/mongoose';
// Mongoose model type
import { Model, Types } from 'mongoose';
// Your schema and DTOs
import { User, UserRole, UserEvent } from './user.schema';
import { CreateUserDto } from './user.dto';
// Password hashing library
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        //Inject thw mongoose User model
        @InjectModel(User.name) private userModel: Model<User>
    ){}

    async create(createUserDto: CreateUserDto){
        const existingUser = await this.userModel.findOne({email:createUserDto.email});
        if(existingUser){
            throw new ConflictException('User with this email already exists');
        }

        // Use consistent salt rounds for password hashing
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

        // Initialize all user fields, even optional ones
        const newUser = new this.userModel({
            firstname: createUserDto.firstname,
            lastname: createUserDto.lastname,
            email: createUserDto.email.toLowerCase(), // Store email in lowercase for consistent comparison
            password: hashedPassword,
            username: '', // Initialize optional fields with empty values
            bio: '',
            profilePicture: '',
            school: '',
            major: '',
            year: '',
            role: UserRole.USER,
            blacklistedTokens: [],
            studyPreferences: '',
            availability: ''
        });

        return await newUser.save();
    }

    async findByEmail(email: string) {
        // Convert email to lowercase for consistent comparison
        return await this.userModel.findOne({ email: email.toLowerCase() });
    }

    async findById(id: string, includeAuth: boolean = false) {
        const user = await this.userModel.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (includeAuth) {
            // Return full user data for auth purposes
            return user;
        }

        // Return formatted profile data for frontend
        const response: any = {
            _id: user._id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            role: user.role
        };

        // Add optional fields only if they have values
        if (user.username) response.username = user.username;
        if (user.profilePicture) response.profilePicture = user.profilePicture;
        if (user.bio) response.bio = user.bio;
        if (user.major) response.major = user.major;
        if (user.school) response.school = user.school;
        if (user.year) response.year = user.year;

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

    async updateUser(id: string, updateData: Partial<User>) {
        const user = await this.userModel.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        
        Object.assign(user, updateData);
        return await user.save();
    }

    async deleteUser(id: string) {
        const result = await this.userModel.findByIdAndDelete(id);
        if (!result) {
            throw new NotFoundException('User not found');
        }
        return { message: 'User deleted successfully' };
    }

    async changePassword(id: string, oldPassword: string, newPassword: string) {
        const user = await this.userModel.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            throw new ConflictException('Invalid old password');
        }

        user.password = await bcrypt.hash(newPassword, 10);
        return await user.save();
    }

    async addEvent(userId: string, eventData: {
        title: string;
        description: string;
        startDate: Date;
        endDate: Date;
        type: 'homework' | 'study' | 'meeting' | 'other';
    }): Promise<User> {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const newEvent = {
            _id: new Types.ObjectId(),
            ...eventData
        };

        user.events = user.events || [];
        user.events.push(newEvent);
        await user.save();

        return user;
    }

    async getUserEvents(userId: string): Promise<UserEvent[]> {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user.events || [];
    }

    async deleteEvent(userId: string, eventId: string): Promise<User> {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const eventIndex = user.events?.findIndex(event => event._id.toString() === eventId);
        if (eventIndex === -1 || eventIndex === undefined) {
            throw new NotFoundException('Event not found');
        }

        user.events.splice(eventIndex, 1);
        await user.save();

        return user;
    }
}
