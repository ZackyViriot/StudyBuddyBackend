import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from '../users/user.dto';
import { Types } from 'mongoose';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) {}

    async login(loginUserDto: LoginUserDto) {
        const user = await this.usersService.findByEmail(loginUserDto.email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(loginUserDto.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return this.generateToken(user);
    }

    async logout(token: string) {
        const decoded = this.jwtService.verify(token);
        const user = await this.usersService.findById(decoded.sub);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        // Add token to user's blacklist
        user.blacklistedTokens = user.blacklistedTokens || [];
        user.blacklistedTokens.push(token);
        await this.usersService.updateUser(user._id.toString(), user);

        return { message: 'Logged out successfully' };
    }

    generateToken(user: any) {
        const payload = { 
            sub: user._id.toString(), 
            email: user.email 
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                _id: user._id.toString(),
                email: user.email,
                firstname: user.firstname,
                lastname: user.lastname,
                school: user.school,
                major: user.major,
                year: user.year,
                bio: user.bio,
                studyPreferences: user.studyPreferences,
                availability: user.availability,
                profilePicture: user.profilePicture
            }
        };
    }

    async validateToken(token: string) {
        try {
            const decoded = this.jwtService.verify(token);
            const user = await this.usersService.findById(decoded.sub);
            
            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            // Check if token is blacklisted
            if (user.blacklistedTokens?.includes(token)) {
                throw new UnauthorizedException('Token has been invalidated');
            }

            return decoded;
        } catch {
            throw new UnauthorizedException('Invalid token');
        }
    }

    async refreshToken(token: string) {
        const decoded = await this.validateToken(token);
        const user = await this.usersService.findById(decoded.sub);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        return this.generateToken(user);
    }
} 