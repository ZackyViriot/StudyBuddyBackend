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
            .populate('tasks.assignedTo', 'firstname lastname email profilePicture')
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
        .populate('tasks.assignedTo', 'firstname lastname email profilePicture')
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

    async updateGoal(teamId: string, goalId: string, updateData: any): Promise<Team> {
        const team = await this.teamModel.findById(teamId);
        if (!team) {
            throw new NotFoundException(`Team with ID ${teamId} not found`);
        }

        const goalIndex = team.goals.findIndex(g => g._id && g._id.toString() === goalId);
        if (goalIndex === -1) {
            throw new NotFoundException(`Goal with ID ${goalId} not found`);
        }

        // Ensure progress is a number between 0 and 100
        if (updateData.progress !== undefined) {
            updateData.progress = Math.min(Math.max(Number(updateData.progress), 0), 100);
            team.goals[goalIndex].progress = updateData.progress;
            team.goals[goalIndex].status = updateData.progress === 100 ? 'achieved' : 'active';
        }

        // Update other goal fields if provided
        if (updateData.title) team.goals[goalIndex].title = updateData.title;
        if (updateData.description) team.goals[goalIndex].description = updateData.description;
        if (updateData.targetDate) team.goals[goalIndex].targetDate = updateData.targetDate;
        if (updateData.status) team.goals[goalIndex].status = updateData.status;

        const updatedTeam = await team.save();
        return updatedTeam.populate([
            { path: 'members.userId', select: 'firstname lastname email profilePicture' },
            { path: 'createdBy', select: 'firstname lastname email profilePicture' }
        ]);
    }

    async addTask(teamId: string, task: any): Promise<Team> {
        const team = await this.teamModel.findById(teamId);
        if (!team) {
            throw new NotFoundException(`Team with ID ${teamId} not found`);
        }

        // Ensure proper date handling
        const newTask = {
            ...task,
            dueDate: new Date(task.dueDate),
            status: task.status || 'pending',
            createdAt: new Date(),
            assignedTo: new Types.ObjectId(task.assignedTo)
        };

        team.tasks.push(newTask);
        
        // Save and populate the team
        const updatedTeam = await this.teamModel.findByIdAndUpdate(
            teamId,
            { $push: { tasks: newTask } },
            { 
                new: true,
                populate: [
                    { path: 'members.userId', select: 'firstname lastname email profilePicture' },
                    { path: 'createdBy', select: 'firstname lastname email profilePicture' },
                    { path: 'tasks.assignedTo', select: 'firstname lastname email profilePicture' }
                ]
            }
        );

        if (!updatedTeam) {
            throw new NotFoundException(`Team with ID ${teamId} not found after update`);
        }

        return updatedTeam;
    }

    async updateTask(teamId: string, taskId: string, updateData: any): Promise<Team> {
        const team = await this.teamModel.findById(teamId);
        if (!team) {
            throw new NotFoundException(`Team with ID ${teamId} not found`);
        }

        const taskIndex = team.tasks.findIndex(t => t._id && t._id.toString() === taskId);
        if (taskIndex === -1) {
            throw new NotFoundException(`Task with ID ${taskId} not found`);
        }

        // Update task fields
        if (updateData.status) {
            team.tasks[taskIndex].status = updateData.status;
        }
        if (updateData.title) {
            team.tasks[taskIndex].title = updateData.title;
        }
        if (updateData.description) {
            team.tasks[taskIndex].description = updateData.description;
        }
        if (updateData.dueDate) {
            team.tasks[taskIndex].dueDate = updateData.dueDate;
        }
        if (updateData.assignedTo) {
            team.tasks[taskIndex].assignedTo = updateData.assignedTo;
        }

        // Use findOneAndUpdate to ensure atomic operation
        const updatedTeam = await this.teamModel.findOneAndUpdate(
            { _id: teamId },
            { $set: { tasks: team.tasks } },
            { new: true }
        ).populate([
            { path: 'members.userId', select: 'firstname lastname email profilePicture' },
            { path: 'createdBy', select: 'firstname lastname email profilePicture' },
            { path: 'tasks.assignedTo', select: 'firstname lastname email profilePicture', model: 'User' }
        ]);

        if (!updatedTeam) {
            throw new NotFoundException(`Team with ID ${teamId} not found after update`);
        }

        return updatedTeam;
    }

    async delete(id: string): Promise<Team> {
        const team = await this.teamModel.findByIdAndDelete(id);
        if (!team) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }
        return team;
    }

    async joinByCode(joinCode: string, userId: Types.ObjectId): Promise<Team> {
        const team = await this.teamModel.findOne({ joinCode });
        if (!team) {
            throw new NotFoundException('Team not found with this join code');
        }

        // Check if user is already a member
        const isMember = team.members.some(member => 
            member.userId.toString() === userId.toString()
        ) || team.createdBy.toString() === userId.toString();

        if (isMember) {
            throw new BadRequestException('User is already a member of this team');
        }

        // Add user as a member
        team.members.push({
            userId,
            role: 'member' as MemberRole
        });

        const savedTeam = await team.save();
        return savedTeam.populate([
            { path: 'members.userId', select: 'firstname lastname email profilePicture' },
            { path: 'createdBy', select: 'firstname lastname email profilePicture' }
        ]);
    }
} 