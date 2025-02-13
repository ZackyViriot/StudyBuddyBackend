import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Patch } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/createTeam.dto';
import { Team } from './team.schema';
import { Types } from 'mongoose';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JoinTeamDto } from './dto/joinTeam.dto';

import { MemberRole } from './team.schema';

@Controller('teams')
@UseGuards(JwtAuthGuard)
export class TeamsController {
    constructor(private readonly teamsService: TeamsService) {}

    @Post()
    async create(@Body() createTeamDto: CreateTeamDto): Promise<Team> {
        return this.teamsService.create(createTeamDto);
    }

    @Get()
    async findAll(): Promise<Team[]> {
        return this.teamsService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Team> {
        return this.teamsService.findOne(id);
    }

    @Get('user/:userId')
    async findTeamsByMember(@Param('userId') userId: string): Promise<Team[]> {
        return this.teamsService.findTeamsByMember(new Types.ObjectId(userId));
    }

    @Post(':teamId/members')
    async addMember(
        @Param('teamId') teamId: string,
        @Body('userId') userId: string,
        @Body('role') role: MemberRole
    ): Promise<Team> {
        return this.teamsService.addMember(
            teamId,
            new Types.ObjectId(userId),
            role
        );
    }

    @Put(':teamId/members/:userId/role')
    async updateMemberRole(
        @Param('teamId') teamId: string,
        @Param('userId') userId: string,
        @Body('role') role: MemberRole
    ): Promise<Team> {
        return this.teamsService.updateMemberRole(
            teamId,
            new Types.ObjectId(userId),
            role
        );
    }

    @Delete(':teamId/members/:userId')
    async removeMember(
        @Param('teamId') teamId: string,
        @Param('userId') userId: string
    ): Promise<Team> {
        return this.teamsService.removeMember(
            teamId,
            new Types.ObjectId(userId)
        );
    }

    @Post(':teamId/goals')
    async addGoal(
        @Param('teamId') teamId: string,
        @Body() goal: any
    ): Promise<Team> {
        return this.teamsService.addGoal(teamId, goal);
    }

    @Patch(':teamId/goals/:goalId')
    async updateGoal(
        @Param('teamId') teamId: string,
        @Param('goalId') goalId: string,
        @Body() updateData: any
    ): Promise<Team> {
        return this.teamsService.updateGoal(teamId, goalId, updateData);
    }

    @Post(':teamId/tasks')
    async addTask(
        @Param('teamId') teamId: string,
        @Body() task: any
    ): Promise<Team> {
        return this.teamsService.addTask(teamId, task);
    }

    @Patch(':teamId/tasks/:taskId')
    async updateTask(
        @Param('teamId') teamId: string,
        @Param('taskId') taskId: string,
        @Body() updateData: any
    ): Promise<Team> {
        return this.teamsService.updateTask(teamId, taskId, updateData);
    }

    @Post('join')
    async joinByCode(@Body() joinTeamDto: JoinTeamDto): Promise<Team> {
        return this.teamsService.joinByCode(
            joinTeamDto.joinCode,
            new Types.ObjectId(joinTeamDto.userId.toString())
        );
    }

    @Delete(':id')
    async delete(@Param('id') id: string): Promise<Team> {
        return this.teamsService.delete(id);
    }
} 