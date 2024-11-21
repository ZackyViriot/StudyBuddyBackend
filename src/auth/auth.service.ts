// Import necessary decorators and exceptions from NestJS framework
import {Injectable, UnauthorizedException, ConflictException} from '@nestjs/common';
// Injectable: Marks the class as injectable (can be used for dependency injection)
// UnauthorizedException: Thrown when authentication fails
// ConflictException: Thrown when there's a conflict (like duplicate entries)

// Import decorator for MongoDB model injection
import {InjectModel} from '@nestjs/mongoose';
// For connecting Mongoose models with NestJS

// Import the User schema
import { User } from './schemas/user.schema';
// Your User model definition (presumably defined elsewhere)

// Import Mongoose Model type
import { Model } from 'mongoose';
// For TypeScript type definition of MongoDB models

// Import bcrypt for password hashing
import * as bcrypt from 'bcryptjs';
// Library for hashing passwords securely

// Import JWT service for token handling
import { JwtService } from '@nestjs/jwt';
// For creating and verifying JSON Web Tokens

// Import DTOs (Data Transfer Objects) for type safety
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
// DTOs define the shape of data for signup and login requests

@Injectable()  // Marks this class as injectable for NestJS dependency injection
export class AuthService {
    constructor(
        @InjectModel(User.name)  // Injects the User model from MongoDB
        private userModel: Model<User>,  // Creates a private property for the User model
        private jwtService: JwtService  // Injects the JWT service
    ){}

    // Signup method
    async signUp(signUpDto: SignUpDto): Promise<{token: string}> {
        // Destructure the signup data
        const {email, username, password, confirmPassword} = signUpDto;

        // Check for existing user with same email or username
        const existingUser = await this.userModel.findOne({ 
            $or: [{ email }, { username }] 
        });
        if (existingUser) {
            throw new ConflictException('User with this email or username already exists');
        }

        // Hash both passwords (note: hashing confirmPassword isn't typically necessary)
        const hashedPassword = await bcrypt.hash(password, 10);  // 10 is the salt rounds
        const hashedConfirmPassword = await bcrypt.hash(confirmPassword, 12);

        // Create new user in database
        const user = await this.userModel.create({
            email,
            username,
            password: hashedPassword,
            confirmPassword: hashedConfirmPassword,
        });

        // Generate JWT token
        const token = this.jwtService.sign(
            { id: user._id },  // Payload
            { expiresIn: '1d' }  // Token expires in 1 day
        );

        return { token };
    }

    // Login method
    async login(loginDto: LoginDto): Promise<{ token: string }> {
        const { email, password } = loginDto;

        // Find user by email
        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new UnauthorizedException('Invalid Email or password');
            // Generic message for security (doesn't specify which is wrong)
        }

        // Compare provided password with stored hash
        const isPasswordMatched = await bcrypt.compare(password, user.password);
        if (!isPasswordMatched) {
            throw new UnauthorizedException('Invalid email or password');
        }

        // Generate JWT token
        const token = this.jwtService.sign(
            { id: user._id },
            { expiresIn: '1d' }
        );
        
        return { token };
    }
}