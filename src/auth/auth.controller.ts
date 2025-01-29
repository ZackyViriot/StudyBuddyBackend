import { Controller, Post, Body, UseGuards, Headers, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from '../users/user.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    async login(@Body() loginUserDto: LoginUserDto) {
        try {
            const result = await this.authService.login(loginUserDto);
            return result;
        } catch (error) {
            throw error;
        }
    }

    @Post('logout')
    async logout(@Headers('authorization') auth: string) {
        try {
            if (!auth) {
                throw new UnauthorizedException('No token provided');
            }
            const token = auth.split(' ')[1]; // Remove 'Bearer ' prefix
            return await this.authService.logout(token);
        } catch (error) {
            throw error;
        }
    }

    @Post('refresh')
    async refreshToken(@Headers('authorization') auth: string) {
        try {
            if (!auth) {
                throw new UnauthorizedException('No token provided');
            }
            const token = auth.split(' ')[1]; // Remove 'Bearer ' prefix
            return await this.authService.refreshToken(token);
        } catch (error) {
            throw error;
        }
    }
}
