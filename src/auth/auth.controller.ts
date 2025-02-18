import { Controller, Post, Body, UnauthorizedException, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from '../users/user.dto';
import { UserRole } from '../users/schemas/user.schema';
import { CreateUserDto } from '../users/user.dto';
import { UsersService } from '../users/users.service';

export interface AuthResponse {
    access_token: string;
    user: {
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
    };
}

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService
    ) {}

    @Post('signup')
    async signup(@Body() createUserDto: CreateUserDto): Promise<AuthResponse> {
        const user = await this.usersService.create(createUserDto);
        return this.authService.login(user);
    }

    @Post('login')
    async login(@Body() loginUserDto: LoginUserDto): Promise<AuthResponse> {
        const user = await this.authService.validateUser(loginUserDto.email, loginUserDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return await this.authService.login(user);
    }

    @Post('logout')
    async logout(
        @Headers('authorization') authHeader: string,
        @Headers('user-id') userId: string
    ) {
        if (!authHeader || !userId) {
            throw new UnauthorizedException('Missing required headers');
        }
        const token = authHeader.replace('Bearer ', '');
        return await this.authService.logout(userId, token);
    }

    @Post('validate')
    async validateToken(@Headers('authorization') authHeader: string): Promise<boolean> {
        if (!authHeader) {
            throw new UnauthorizedException('Missing authorization header');
        }
        const token = authHeader.replace('Bearer ', '');
        return await this.authService.validateToken(token);
    }
}
