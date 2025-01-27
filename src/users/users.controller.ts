import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { User } from './user.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    async createUser(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async getUser(@Param('id') id: string) {
        return this.usersService.findById(id);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async updateUser(
        @Param('id') id: string,
        @Body() updateData: UpdateUserDto
    ) {
        return this.usersService.updateUser(id, updateData);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async deleteUser(@Param('id') id: string) {
        return this.usersService.deleteUser(id);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id/password')
    async changePassword(
        @Param('id') id: string,
        @Body() passwordData: { oldPassword: string; newPassword: string }
    ) {
        return this.usersService.changePassword(
            id,
            passwordData.oldPassword,
            passwordData.newPassword
        );
    }
} 