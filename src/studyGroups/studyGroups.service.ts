import {Injectable,ConflictException,NotFoundException,BadRequestException} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StudyGroup,StudyGroupDocument,MemberRole } from './studyGroup.schema';
import { CreateStudyGroupDto } from './dto/createStudyGroup.dto';
import { User } from '../users/user.schema';
import { Meeting, MeetingDocument } from './meeting.schema';
import { CreateMeetingDto } from './dto/createMeeting.dto';

@Injectable()
export class StudyGroupsService {
    constructor(
        @InjectModel(StudyGroup.name) private studyGroupModel: Model<StudyGroupDocument>,
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Meeting.name) private meetingModel: Model<MeetingDocument>
    ) {}

    //create a study group 
    async create(createStudyGroupDto: CreateStudyGroupDto): Promise<StudyGroup> {
        const existingStudyGroup = await this.studyGroupModel.findOne({name:createStudyGroupDto.name});
        if(existingStudyGroup){
            throw new ConflictException('Study group with this name already exists');
        }

        const createdGroup = new this.studyGroupModel(createStudyGroupDto);
        // Add creator as admin member
        createdGroup.members = [{
            userId: new Types.ObjectId(createStudyGroupDto.createdBy),
            role: 'admin' as MemberRole
        }];
        const savedGroup = await createdGroup.save();

        // Add study group to creator's studyGroups
        await this.userModel.findByIdAndUpdate(
            createStudyGroupDto.createdBy,
            { $push: { studyGroups: savedGroup._id } }
        );

        return savedGroup.populate({
            path: 'members.userId createdBy',
            select: 'firstname lastname email'
        });
    }
    

    //function to delete a study group 
    async delete(id:string){
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid study group ID');
        }

        const result = await this.studyGroupModel.deleteOne({ _id: new Types.ObjectId(id) }).exec();
        if (result.deletedCount === 0) {
            throw new NotFoundException('Study group not found');
        }
    }

    //function find all for a study group page 
    async findAll(): Promise<StudyGroup[]> {
        return this.studyGroupModel.find()
            .populate('createdBy', 'firstname lastname email profilePicture')
            .populate('members.userId', 'firstname lastname email profilePicture')
            .exec();
    }

    async findByName(name:string){
        return await this.studyGroupModel.findOne({name})
            .populate('createdBy', 'firstname lastname email profilePicture')
            .populate('members.userId', 'firstname lastname email profilePicture');
    }

    async findOne(id: string): Promise<StudyGroup> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid study group ID');
        }

        try {
            console.log('Finding study group:', id);
            const group = await this.studyGroupModel.findById(id)
                .populate({
                    path: 'members.userId',
                    select: 'firstname lastname email profilePicture _id',
                    model: 'User'
                })
                .populate('createdBy', 'firstname lastname email profilePicture')
                .exec();

            if (!group) {
                throw new NotFoundException('Study group not found');
            }

            console.log('Found group members:', group.members.map(m => ({
                userId: m.userId?._id?.toString(),
                role: m.role
            })));

            return group;
        } catch (error) {
            console.error('Error in findOne:', error);
            throw error;
        }
    }

    async getUserStudyGroups(userId: string): Promise<StudyGroup[]> {
        return this.studyGroupModel.find({
            'members.userId': new Types.ObjectId(userId)
        })
        .populate('createdBy', 'firstname lastname email profilePicture')
        .populate('members.userId', 'firstname lastname email profilePicture')
        .exec();
    }

    async update(id: string, updateData: Partial<StudyGroup>): Promise<StudyGroup> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid study group ID');
        }

        // Validate time format if provided
        if (updateData.startTime) {
            const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
            if (!timeRegex.test(updateData.startTime)) {
                throw new BadRequestException('Invalid start time format. Use HH:mm format');
            }
        }

        if (updateData.endTime) {
            const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
            if (!timeRegex.test(updateData.endTime)) {
                throw new BadRequestException('Invalid end time format. Use HH:mm format');
            }
        }

        // Remove fields that shouldn't be updated directly
        delete updateData.members;
        delete updateData.createdBy;

        const updatedGroup = await this.studyGroupModel
            .findByIdAndUpdate(id, updateData, { new: true })
            .populate('createdBy', 'firstname lastname email')
            .populate('members.userId', 'firstname lastname email')
            .exec();

        if (!updatedGroup) {
            throw new NotFoundException('Study group not found');
        }

        return updatedGroup;
    }

    async addUserToStudyGroup(groupId: string, userId: string): Promise<StudyGroup> {
        if (!Types.ObjectId.isValid(groupId)) {
            throw new BadRequestException('Invalid study group ID');
        }

        const group = await this.studyGroupModel.findById(groupId);
        if (!group) {
            throw new NotFoundException('Study group not found');
        }

        // Check if user is already a member
        const isMember = group.members.some(member => member.userId.toString() === userId);
        if (isMember) {
            throw new BadRequestException('User is already a member of this group');
        }

        // Add user as regular member
        group.members.push({
            userId: new Types.ObjectId(userId),
            role: 'member' as MemberRole
        });

        const savedGroup = await group.save();

        // Add study group to user's studyGroups
        await this.userModel.findByIdAndUpdate(
            userId,
            { $push: { studyGroups: group._id } }
        );

        return savedGroup.populate({
            path: 'members.userId createdBy',
            select: 'firstname lastname email profilePicture'
        });
    }

    async removeUserFromStudyGroup(groupId: string, userId: string): Promise<StudyGroup> {
        if (!Types.ObjectId.isValid(groupId)) {
            throw new BadRequestException('Invalid study group ID');
        }

        const group = await this.studyGroupModel.findById(groupId);
        if (!group) {
            throw new NotFoundException('Study group not found');
        }

        // Check if user is the creator
        if (group.createdBy.toString() === userId) {
            throw new BadRequestException('Creator cannot leave the group');
        }

        // Remove user from members
        group.members = group.members.filter(member => member.userId.toString() !== userId);
        const savedGroup = await group.save();

        // Remove study group from user's study groups
        await this.userModel.findByIdAndUpdate(
            userId,
            { $pull: { studyGroups: new Types.ObjectId(groupId) } }
        );

        return savedGroup.populate({
            path: 'members.userId createdBy',
            select: 'firstname lastname email profilePicture'
        });
    }

    async updateMemberRole(groupId: string, userId: string, newRole: MemberRole): Promise<StudyGroup> {
        if (!Types.ObjectId.isValid(groupId)) {
            throw new BadRequestException('Invalid study group ID');
        }

        const group = await this.studyGroupModel.findById(groupId);
        if (!group) {
            throw new NotFoundException('Study group not found');
        }

        // Find and update member's role
        const memberIndex = group.members.findIndex(member => member.userId.toString() === userId);
        if (memberIndex === -1) {
            throw new NotFoundException('User is not a member of this group');
        }

        group.members[memberIndex].role = newRole;
        const savedGroup = await group.save();

        return savedGroup.populate({
            path: 'members.userId createdBy',
            select: 'firstname lastname email profilePicture'
        });
    }

    async addMeeting(groupId: string, createMeetingDto: CreateMeetingDto): Promise<Meeting> {
        if (!Types.ObjectId.isValid(groupId)) {
            throw new BadRequestException('Invalid study group ID');
        }

        const group = await this.studyGroupModel.findById(groupId);
        if (!group) {
            throw new NotFoundException('Study group not found');
        }

        const meeting = new this.meetingModel({
            ...createMeetingDto,
            studyGroupId: new Types.ObjectId(groupId),
            createdBy: new Types.ObjectId(createMeetingDto.createdBy)
        });

        const savedMeeting = await meeting.save();
        return savedMeeting.populate([
            { path: 'createdBy', select: 'firstname lastname email profilePicture' },
            { path: 'studyGroupId', select: 'name' }
        ]);
    }

    async getMeetings(groupId: string): Promise<Meeting[]> {
        if (!Types.ObjectId.isValid(groupId)) {
            throw new BadRequestException('Invalid study group ID');
        }

        try {
            const meetings = await this.meetingModel.find({ 
                studyGroupId: new Types.ObjectId(groupId) 
            })
            .populate('createdBy', 'firstname lastname email profilePicture')
            .populate('studyGroupId', 'name')
            .sort({ date: 1, startTime: 1 })
            .exec();

            return meetings;
        } catch (error) {
            throw new BadRequestException('Error fetching meetings');
        }
    }

    async getMeeting(groupId: string, meetingId: string): Promise<Meeting> {
        if (!Types.ObjectId.isValid(groupId) || !Types.ObjectId.isValid(meetingId)) {
            throw new BadRequestException('Invalid ID provided');
        }

        const meeting = await this.meetingModel.findOne({
            _id: new Types.ObjectId(meetingId),
            studyGroupId: new Types.ObjectId(groupId)
        })
        .populate('createdBy', 'firstname lastname email profilePicture')
        .populate('studyGroupId', 'name')
        .exec();

        if (!meeting) {
            throw new NotFoundException('Meeting not found');
        }

        return meeting;
    }

    async updateMeeting(groupId: string, meetingId: string, updateData: Partial<Meeting>): Promise<Meeting> {
        if (!Types.ObjectId.isValid(groupId) || !Types.ObjectId.isValid(meetingId)) {
            throw new BadRequestException('Invalid ID provided');
        }

        const meeting = await this.meetingModel.findOneAndUpdate(
            {
                _id: new Types.ObjectId(meetingId),
                studyGroupId: new Types.ObjectId(groupId)
            },
            updateData,
            { new: true }
        )
        .populate('createdBy', 'firstname lastname email profilePicture')
        .populate('studyGroupId', 'name')
        .exec();

        if (!meeting) {
            throw new NotFoundException('Meeting not found');
        }

        return meeting;
    }

    async deleteMeeting(groupId: string, meetingId: string): Promise<void> {
        if (!Types.ObjectId.isValid(groupId) || !Types.ObjectId.isValid(meetingId)) {
            throw new BadRequestException('Invalid ID provided');
        }

        const result = await this.meetingModel.deleteOne({
            _id: new Types.ObjectId(meetingId),
            studyGroupId: new Types.ObjectId(groupId)
        });

        if (result.deletedCount === 0) {
            throw new NotFoundException('Meeting not found');
        }
    }
}
