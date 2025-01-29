import {Injectable,ConflictException,NotFoundException,BadRequestException} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StudyGroup,StudyGroupDocument,MemberRole } from './studyGroup.schema';
import { CreateStudyGroupDto } from './dto/createStudyGroup.dto';
import { User } from '../users/user.schema';

@Injectable()
export class StudyGroupsService {
    constructor(
        @InjectModel(StudyGroup.name) private studyGroupModel: Model<StudyGroupDocument>,
        @InjectModel(User.name) private userModel: Model<User>
    ){}


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
            .populate('createdBy', 'firstname lastname email')
            .populate('members.userId', 'firstname lastname email')
            .exec();
    }

    async findByName(name:string){
        return await this.studyGroupModel.findOne({name}).populate('members createdBy');
    }

    async findOne(id: string): Promise<StudyGroup> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid study group ID');
        }
        const group = await this.studyGroupModel.findById(id)
            .populate('createdBy', 'firstname lastname email')
            .populate('members.userId', 'firstname lastname email')
            .exec();
        if (!group) {
            throw new NotFoundException('Study group not found');
        }
        return group;
    }

    async getUserStudyGroups(userId: string): Promise<StudyGroup[]> {
        return this.studyGroupModel.find({
            'members.userId': new Types.ObjectId(userId)
        })
        .populate('createdBy', 'firstname lastname email')
        .populate('members.userId', 'firstname lastname email')
        .exec();
    }

    async update(id: string, updateData: Partial<StudyGroup>): Promise<StudyGroup> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid study group ID');
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
            select: 'firstname lastname email'
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
            select: 'firstname lastname email'
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
            select: 'firstname lastname email'
        });
    }
}
