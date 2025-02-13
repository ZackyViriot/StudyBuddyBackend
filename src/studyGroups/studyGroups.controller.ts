import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Put, UnauthorizedException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { StudyGroupsService } from './studyGroups.service';
import { CreateStudyGroupDto } from './dto/createStudyGroup.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MemberRole } from './studyGroup.schema';

@Controller('studyGroups')
@UseGuards(JwtAuthGuard)
export class StudyGroupsController {
    constructor(private readonly studyGroupsService: StudyGroupsService) {}

    @Post()
    async create(@Body() createStudyGroupDto: CreateStudyGroupDto, @Request() req) {
        try {
            createStudyGroupDto.createdBy = req.user.userId;
            return await this.studyGroupsService.create(createStudyGroupDto);
        } catch (error) {
            throw error;
        }
    }

    @Get()
    async findAll(@Request() req) {
        try {
            return await this.studyGroupsService.findAll();
        } catch (error) {
            throw error;
        }
    }

    @Get('myGroups')
    async getUserStudyGroups(@Request() req) {
        try {
            return await this.studyGroupsService.getUserStudyGroups(req.user.userId);
        } catch (error) {
            throw error;
        }
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        try {
            const group = await this.studyGroupsService.findOne(id);
            if (!group) {
                throw new NotFoundException('Study group not found');
            }
            return group;
        } catch (error) {
            throw error;
        }
    }

    @Post(':id/join')
    async joinStudyGroup(@Param('id') id: string, @Request() req) {
        try {
            return await this.studyGroupsService.addUserToStudyGroup(id, req.user.userId);
        } catch (error) {
            throw error;
        }
    }

    @Delete(':id/leave')
    async leaveStudyGroup(@Param('id') id: string, @Request() req) {
        try {
            return await this.studyGroupsService.removeUserFromStudyGroup(id, req.user.userId);
        } catch (error) {
            throw error;
        }
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateData: any, @Request() req) {
        try {
            const group = await this.studyGroupsService.findOne(id);
            if (!group) {
                throw new NotFoundException('Study group not found');
            }

            // Check if user is admin or creator
            const isAdmin = group.members.some(member => 
                member.userId.toString() === req.user.userId && member.role === 'admin'
            );
            const isCreator = group.createdBy.toString() === req.user.userId;

            if (!isAdmin && !isCreator) {
                throw new ForbiddenException('You do not have permission to update this group');
            }

            return await this.studyGroupsService.update(id, updateData);
        } catch (error) {
            throw error;
        }
    }

    @Delete(':id')
    async delete(@Param('id') id: string, @Request() req) {
        try {
            const group = await this.studyGroupsService.findOne(id);
            if (!group) {
                throw new NotFoundException('Study group not found');
            }

            // Check if user is an admin of the group
            const isAdmin = group.members.some(member => {
                const memberId = member.userId._id ? member.userId._id.toString() : member.userId.toString();
                return memberId === req.user.userId && member.role === 'admin';
            });

            console.log('Backend Delete Authorization Debug:', {
                requestUserId: req.user.userId,
                isAdmin,
                members: group.members.map(m => ({
                    userId: m.userId._id ? m.userId._id.toString() : m.userId.toString(),
                    role: m.role
                }))
            });

            if (!isAdmin) {
                throw new ForbiddenException('Only admins can delete the group');
            }

            return await this.studyGroupsService.delete(id);
        } catch (error) {
            throw error;
        }
    }

    @Put(':id/members/:userId/role')
    async updateMemberRole(
        @Param('id') id: string,
        @Param('userId') userId: string,
        @Body('role') role: MemberRole,
        @Request() req
    ) {
        try {
            const group = await this.studyGroupsService.findOne(id);
            if (!group) {
                throw new NotFoundException('Study group not found');
            }

            // Check if user is admin or creator
            const isAdmin = group.members.some(member => 
                member.userId.toString() === req.user.userId && member.role === 'admin'
            );
            const isCreator = group.createdBy.toString() === req.user.userId;

            if (!isAdmin && !isCreator) {
                throw new ForbiddenException('You do not have permission to update member roles');
            }

            return await this.studyGroupsService.updateMemberRole(id, userId, role);
        } catch (error) {
            throw error;
        }
    }
} 