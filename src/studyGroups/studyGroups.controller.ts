import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Put, UnauthorizedException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { StudyGroupsService } from './studyGroups.service';
import { CreateStudyGroupDto } from './dto/createStudyGroup.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MemberRole } from './studyGroup.schema';
import { CreateMeetingDto } from './dto/createMeeting.dto';
import { Meeting } from './meeting.schema';

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
            const isAdmin = group.members.some(member => {
                if (!member || !member.userId) return false;
                const memberId = member.userId._id ? member.userId._id.toString() : member.userId.toString();
                return memberId === req.user.userId && member.role === 'admin';
            });

            const isCreator = group.createdBy ? (
                group.createdBy._id 
                    ? group.createdBy._id.toString() === req.user.userId 
                    : group.createdBy.toString() === req.user.userId
            ) : false;

            if (!isAdmin && !isCreator) {
                throw new ForbiddenException('You do not have permission to update this group');
            }

            return await this.studyGroupsService.update(id, updateData);
        } catch (error) {
            console.error('Error in update method:', error);
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
                if (!member || !member.userId) return false;
                const memberId = member.userId._id ? member.userId._id.toString() : member.userId.toString();
                return memberId === req.user.userId && member.role === 'admin';
            });

            console.log('Backend Delete Authorization Debug:', {
                requestUserId: req.user.userId,
                isAdmin,
                members: group.members.map(m => ({
                    userId: m.userId?._id ? m.userId._id.toString() : m.userId?.toString(),
                    role: m.role
                }))
            });

            if (!isAdmin) {
                throw new ForbiddenException('Only admins can delete the group');
            }

            return await this.studyGroupsService.delete(id);
        } catch (error) {
            console.error('Error in delete method:', error);
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
            const isAdmin = group.members.some(member => {
                if (!member || !member.userId) return false;
                const memberId = member.userId._id ? member.userId._id.toString() : member.userId.toString();
                return memberId === req.user.userId && member.role === 'admin';
            });

            const isCreator = group.createdBy ? (
                group.createdBy._id 
                    ? group.createdBy._id.toString() === req.user.userId 
                    : group.createdBy.toString() === req.user.userId
            ) : false;

            if (!isAdmin && !isCreator) {
                throw new ForbiddenException('You do not have permission to update member roles');
            }

            return await this.studyGroupsService.updateMemberRole(id, userId, role);
        } catch (error) {
            console.error('Error in updateMemberRole method:', error);
            throw error;
        }
    }

    @Post(':id/meetings')
    async addMeeting(
        @Param('id') id: string,
        @Body() createMeetingDto: CreateMeetingDto,
        @Request() req
    ) {
        try {
            const group = await this.studyGroupsService.findOne(id);
            if (!group) {
                throw new NotFoundException('Study group not found');
            }

            // Check if user is a member of the group
            const isMember = group.members.some(member => {
                if (!member || !member.userId) return false;
                const memberId = member.userId._id ? member.userId._id.toString() : member.userId.toString();
                return memberId === req.user.userId;
            });

            if (!isMember) {
                throw new ForbiddenException('You must be a member of the group to add meetings');
            }

            createMeetingDto.createdBy = req.user.userId;
            createMeetingDto.studyGroupId = id;
            return await this.studyGroupsService.addMeeting(id, createMeetingDto);
        } catch (error) {
            console.error('Error in addMeeting method:', error);
            throw error;
        }
    }

    @Get(':id/meetings')
    async getMeetings(@Param('id') id: string, @Request() req) {
        try {
            console.log('Getting meetings for group:', id, 'User:', req.user.userId);
            const group = await this.studyGroupsService.findOne(id);
            
            if (!group) {
                throw new NotFoundException('Study group not found');
            }

            console.log('Group members:', group.members.map(m => ({
                userId: m.userId?._id?.toString() || m.userId?.toString(),
                role: m.role
            })));

            const isMember = group.members.some(member => {
                const memberId = member.userId?._id?.toString() || member.userId?.toString();
                console.log('Checking member:', memberId, 'against user:', req.user.userId);
                return memberId === req.user.userId;
            });

            if (!isMember) {
                console.log('User is not a member of the group');
                throw new UnauthorizedException('You must be a member of the group to view meetings');
            }

            console.log('User is a member, fetching meetings');
            return await this.studyGroupsService.getMeetings(id);
        } catch (error) {
            console.error('Error in getMeetings:', error);
            throw error;
        }
    }

    @Get(':id/meetings/:meetingId')
    async getMeeting(
        @Param('id') id: string,
        @Param('meetingId') meetingId: string,
        @Request() req
    ) {
        try {
            const group = await this.studyGroupsService.findOne(id);
            if (!group) {
                throw new NotFoundException('Study group not found');
            }

            // Check if user is a member of the group
            const isMember = group.members.some(member => 
                member.userId && member.userId._id && member.userId._id.toString() === req.user.userId
            );
            if (!isMember) {
                throw new ForbiddenException('You must be a member of the group to view meetings');
            }

            return await this.studyGroupsService.getMeeting(id, meetingId);
        } catch (error) {
            throw error;
        }
    }

    @Put(':id/meetings/:meetingId')
    async updateMeeting(
        @Param('id') id: string,
        @Param('meetingId') meetingId: string,
        @Body() updateData: Partial<Meeting>,
        @Request() req
    ) {
        try {
            const group = await this.studyGroupsService.findOne(id);
            if (!group) {
                throw new NotFoundException('Study group not found');
            }

            // Check if user is a member of the group
            const isMember = group.members.some(member => 
                member.userId && member.userId._id && member.userId._id.toString() === req.user.userId
            );
            if (!isMember) {
                throw new ForbiddenException('You must be a member of the group to update meetings');
            }

            const meeting = await this.studyGroupsService.getMeeting(id, meetingId);
            if (meeting.createdBy.toString() !== req.user.userId) {
                throw new ForbiddenException('Only the meeting creator can update the meeting');
            }

            return await this.studyGroupsService.updateMeeting(id, meetingId, updateData);
        } catch (error) {
            throw error;
        }
    }

    @Delete(':id/meetings/:meetingId')
    async deleteMeeting(
        @Param('id') id: string,
        @Param('meetingId') meetingId: string,
        @Request() req
    ) {
        try {
            const group = await this.studyGroupsService.findOne(id);
            if (!group) {
                throw new NotFoundException('Study group not found');
            }

            // Check if user is a member of the group
            const isMember = group.members.some(member => 
                member.userId && member.userId._id && member.userId._id.toString() === req.user.userId
            );
            if (!isMember) {
                throw new ForbiddenException('You must be a member of the group to delete meetings');
            }

            const meeting = await this.studyGroupsService.getMeeting(id, meetingId);
            if (meeting.createdBy.toString() !== req.user.userId) {
                throw new ForbiddenException('Only the meeting creator can delete the meeting');
            }

            await this.studyGroupsService.deleteMeeting(id, meetingId);
            return { message: 'Meeting deleted successfully' };
        } catch (error) {
            throw error;
        }
    }
} 