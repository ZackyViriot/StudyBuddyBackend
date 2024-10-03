
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<User>,
        private jwtService: JwtService
    ){}

    async signUp(signUpDto: SignUpDto): Promise<{ token: string }> {
        const { email, username, password, confirmPassword } = signUpDto;

        // Check if user with the same email or username already exists
        const existingUser = await this.userModel.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            throw new ConflictException('User with this email or username already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const hashedConfirmPassword = await bcrypt.hash(confirmPassword, 12);

        const user = await this.userModel.create({
            email,
            username,
            password: hashedPassword,
            confirmPassword: hashedConfirmPassword,
        });

        const token = this.jwtService.sign({ id: user._id },{expiresIn:'1d'});

        return { token };
    }

    async login(loginDto: LoginDto): Promise<{ token: string }> {
        const { email, password } = loginDto;

        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new UnauthorizedException('Invalid Email or password');
        }

        const isPasswordMatched = await bcrypt.compare(password, user.password);

        if (!isPasswordMatched) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const token = this.jwtService.sign({ id: user._id },{expiresIn:'1d'});
        
        return { token };
    }
}
