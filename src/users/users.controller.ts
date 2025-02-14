import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, NotFoundException, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { User } from './user.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Types } from 'mongoose';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    private validateObjectId(id: string): boolean {
        return Types.ObjectId.isValid(id);
    }

    @Post()
    async createUser(@Body() createUserDto: CreateUserDto) {
        try {
            return await this.usersService.create(createUserDto);
        } catch (error) {
            throw error;
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async getUser(@Param('id') id: string) {
        try {
            if (!this.validateObjectId(id)) {
                throw new BadRequestException('Invalid user ID format');
            }

            const user = await this.usersService.findById(id);
            if (!user) {
                throw new NotFoundException('User not found');
            }
            return user;
        } catch (error) {
            throw error;
        }
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async updateUser(
        @Param('id') id: string,
        @Body() updateData: UpdateUserDto
    ) {
        try {
            if (!this.validateObjectId(id)) {
                throw new BadRequestException('Invalid user ID format');
            }

            const user = await this.usersService.updateUser(id, updateData);
            if (!user) {
                throw new NotFoundException('User not found');
            }
            return user;
        } catch (error) {
            throw error;
        }
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async deleteUser(@Param('id') id: string) {
        try {
            if (!this.validateObjectId(id)) {
                throw new BadRequestException('Invalid user ID format');
            }

            const result = await this.usersService.deleteUser(id);
            if (!result) {
                throw new NotFoundException('User not found');
            }
            return { message: 'User deleted successfully' };
        } catch (error) {
            throw error;
        }
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id/password')
    async changePassword(
        @Param('id') id: string,
        @Body() passwordData: { oldPassword: string; newPassword: string }
    ) {
        try {
            if (!this.validateObjectId(id)) {
                throw new BadRequestException('Invalid user ID format');
            }

            if (!passwordData.oldPassword || !passwordData.newPassword) {
                throw new BadRequestException('Both old and new passwords are required');
            }

            return await this.usersService.changePassword(
                id,
                passwordData.oldPassword,
                passwordData.newPassword
            );
        } catch (error) {
            throw error;
        }
    }
} 