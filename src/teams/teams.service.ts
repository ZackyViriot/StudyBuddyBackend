import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Team, TeamDocument } from './team.schema';
import { CreateTeamDto } from './dto/createTeam.dto';
import { MemberRole } from './team.schema';

@Injectable()
export class TeamsService {
    constructor(
        @InjectModel(Team.name) private teamModel: Model<TeamDocument>
    ) {}

    async create(createTeamDto: CreateTeamDto): Promise<Team> {
        // Initialize members array with creator as admin
        const members = [{
            userId: new Types.ObjectId(createTeamDto.createdBy.toString()),
            role: 'admin' as MemberRole
        }];
        
        // Add any additional members from the DTO
        if (createTeamDto.members && createTeamDto.members.length > 0) {
            // Filter out any duplicate members and ensure creator remains admin
            const additionalMembers = createTeamDto.members.filter(
                member => member.userId.toString() !== createTeamDto.createdBy.toString()
            );
            members.push(...additionalMembers.map(member => ({
                userId: new Types.ObjectId(member.userId.toString()),
                role: member.role
            })));
        }
        
        // Create team with members already set
        const teamData = {
            ...createTeamDto,
            members: members,
            createdBy: new Types.ObjectId(createTeamDto.createdBy.toString())
        };
        
        const team = new this.teamModel(teamData);
        const savedTeam = await team.save();
        return savedTeam.populate([
            { path: 'members.userId', select: 'firstname lastname email profilePicture' },
            { path: 'createdBy', select: 'firstname lastname email profilePicture' }
        ]);
    }

    async findAll(): Promise<Team[]> {
        return this.teamModel.find()
            .populate('members.userId', 'firstname lastname email profilePicture')
            .populate('createdBy', 'firstname lastname email profilePicture')
            .exec();
    }

    async findOne(id: string): Promise<Team> {
        const team = await this.teamModel.findById(id)
            .populate('members.userId', 'firstname lastname email profilePicture')
            .populate('createdBy', 'firstname lastname email profilePicture')
            .exec();
        if (!team) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }
        return team;
    }

    async findTeamsByMember(userId: Types.ObjectId): Promise<Team[]> {
        return this.teamModel.find({
            'members.userId': userId
        })
        .populate('members.userId', 'firstname lastname email profilePicture')
        .populate('createdBy', 'firstname lastname email profilePicture')
        .exec();
    }

    async addMember(teamId: string, userId: Types.ObjectId, role: MemberRole = 'member'): Promise<Team> {
        const team = await this.teamModel.findById(teamId);
        if (!team) {
            throw new NotFoundException(`Team with ID ${teamId} not found`);
        }

        // Check if user is already a member
        if (team.members.some(member => member.userId.equals(userId))) {
            throw new BadRequestException('User is already a member of this team');
        }

        team.members.push({ userId, role });
        return team.save();
    }

    async updateMemberRole(teamId: string, userId: Types.ObjectId, newRole: MemberRole): Promise<Team> {
        const team = await this.teamModel.findOneAndUpdate(
            { 
                _id: teamId,
                'members.userId': userId
            },
            {
                $set: { 'members.$.role': newRole }
            },
            { new: true }
        );

        if (!team) {
            throw new NotFoundException(`Team or member not found`);
        }

        return team;
    }

    async removeMember(teamId: string, userId: Types.ObjectId): Promise<Team> {
        const team = await this.teamModel.findById(teamId);
        if (!team) {
            throw new NotFoundException(`Team with ID ${teamId} not found`);
        }

        // Prevent removing the last admin
        const adminMembers = team.members.filter(member => member.role === 'admin');
        if (adminMembers.length === 1 && adminMembers[0].userId.equals(userId)) {
            throw new BadRequestException('Cannot remove the last admin from the team');
        }

        team.members = team.members.filter(member => !member.userId.equals(userId));
        return team.save();
    }

    async addGoal(teamId: string, goal: any): Promise<Team> {
        const team = await this.teamModel.findById(teamId);
        if (!team) {
            throw new NotFoundException(`Team with ID ${teamId} not found`);
        }

        team.goals.push(goal);
        return team.save();
    }

    async addTask(teamId: string, task: any): Promise<Team> {
        const team = await this.teamModel.findById(teamId);
        if (!team) {
            throw new NotFoundException(`Team with ID ${teamId} not found`);
        }

        team.tasks.push(task);
        return team.save();
    }

    async delete(id: string): Promise<Team> {
        const team = await this.teamModel.findByIdAndDelete(id);
        if (!team) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }
        return team;
    }
} 