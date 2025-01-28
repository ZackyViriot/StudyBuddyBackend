// Import necessary decorators and utilities from NestJS
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
// Mongoose-specific decorator for dependency injection
import { InjectModel } from '@nestjs/mongoose';
// Mongoose model type
import { Model } from 'mongoose';
// Your schema and DTOs
import { User, UserRole } from './user.schema';
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

        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        // Initialize all user fields, even optional ones
        const newUser = new this.userModel({
            firstname: createUserDto.firstname,
            lastname: createUserDto.lastname,
            email: createUserDto.email,
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
        return await this.userModel.findOne({ email });
    }

    async findById(id: string) {
        return await this.userModel.findById(id);
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
}
