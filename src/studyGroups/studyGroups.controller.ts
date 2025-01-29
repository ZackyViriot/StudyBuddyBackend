import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Put } from '@nestjs/common';
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
        createStudyGroupDto.createdBy = req.user.userId;
        return this.studyGroupsService.create(createStudyGroupDto);
    }

    @Get()
    async findAll() {
        return this.studyGroupsService.findAll();
    }

    @Get('myGroups')
    async getUserStudyGroups(@Request() req) {
        return this.studyGroupsService.getUserStudyGroups(req.user.userId);
    }

    @Post(':id/join')
    async joinStudyGroup(@Param('id') id: string, @Request() req) {
        return this.studyGroupsService.addUserToStudyGroup(id, req.user.userId);
    }

    @Delete(':id/leave')
    async leaveStudyGroup(@Param('id') id: string, @Request() req) {
        return this.studyGroupsService.removeUserFromStudyGroup(id, req.user.userId);
    }

    @Put(':id/members/:userId/role')
    async updateMemberRole(
        @Param('id') id: string,
        @Param('userId') userId: string,
        @Body('role') role: MemberRole,
        @Request() req
    ) {
        // TODO: Add authorization check to ensure only admins can update roles
        return this.studyGroupsService.updateMemberRole(id, userId, role);
    }

    @Delete(':id')
    async delete(@Param('id') id: string, @Request() req) {
        // TODO: Add authorization check to ensure only admins can delete groups
        return this.studyGroupsService.delete(id);
    }
} 