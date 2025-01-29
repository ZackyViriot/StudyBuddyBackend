import {Injectable,ConflictException,NotFoundException} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StudyGroup,StudyGroupDocument } from './studyGroup.schema';
import { CreateStudyGroupDto } from './dto/createStudyGroup.dto';
import { User } from '../users/user.schema';
import { MemberRole } from './studyGroup.schema';

@Injectable()
export class StudyGroupsService {
    constructor(
        @InjectModel(StudyGroup.name) private studyGroupModel: Model<StudyGroup>,
        @InjectModel(User.name) private userModel: Model<User>
    ){}


    //create a study group 
    async create(createStudyGroupDto: CreateStudyGroupDto){
        const existingStudyGroup = await this.studyGroupModel.findOne({name:createStudyGroupDto.name});
        if(existingStudyGroup){
            throw new ConflictException('Study group with this name already exists');
        }

        // Set up initial members array with creator as admin
        const members = [{
            userId: new Types.ObjectId(createStudyGroupDto.createdBy),
            role: 'admin' as const
        }];

        const newStudyGroupData = {
            ...createStudyGroupDto,
            createdBy: new Types.ObjectId(createStudyGroupDto.createdBy),
            members
        };

        const newStudyGroup = new this.studyGroupModel(newStudyGroupData);
        const savedGroup = await newStudyGroup.save();

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
        const studyGroup = await this.studyGroupModel.findById(id);
        if(!studyGroup){
            throw new NotFoundException('Study group not found');
        }
        
        // Remove the study group from all members' studyGroups arrays
        await this.userModel.updateMany(
            { studyGroups: new Types.ObjectId(id) },
            { $pull: { studyGroups: new Types.ObjectId(id) } }
        );

        return this.studyGroupModel.findByIdAndDelete(id);
    }

    //function find all for a study group page 
    async findAll(): Promise<StudyGroup[]> {
        return this.studyGroupModel.find().populate('members createdBy').exec();
    }

    async findByName(name:string){
        return await this.studyGroupModel.findOne({name}).populate('members createdBy');
    }

    async findById(id:string){
        return await this.studyGroupModel.findById(id).populate('members createdBy');
    }

    async getUserStudyGroups(userId: string): Promise<StudyGroup[]> {
        const objectId = new Types.ObjectId(userId);
        return this.studyGroupModel.find({
            $or: [
                { createdBy: objectId },
                { members: objectId }
            ]
        }).populate('members createdBy').exec();
    }

    async addUserToStudyGroup(groupId: string, userId: string) {
        const studyGroup = await this.studyGroupModel.findById(groupId);
        if (!studyGroup) {
            throw new NotFoundException('Study group not found');
        }

        const existingMember = studyGroup.members.find(member => member.userId.toString() === userId);
        if (existingMember) {
            throw new ConflictException('User is already a member of this study group');
        }

        // Add user as a regular member
        studyGroup.members.push({
            userId: new Types.ObjectId(userId),
            role: 'member' as const
        });

        await studyGroup.save();

        // Add study group to user's studyGroups
        await this.userModel.findByIdAndUpdate(
            userId,
            { $push: { studyGroups: groupId } }
        );

        return studyGroup.populate({
            path: 'members.userId createdBy',
            select: 'firstname lastname email'
        });
    }

    async updateMemberRole(groupId: string, userId: string, newRole: MemberRole) {
        const studyGroup = await this.studyGroupModel.findById(groupId);
        if (!studyGroup) {
            throw new NotFoundException('Study group not found');
        }

        const memberIndex = studyGroup.members.findIndex(member => member.userId.toString() === userId);
        if (memberIndex === -1) {
            throw new NotFoundException('User is not a member of this study group');
        }

        // Don't allow changing the role of the creator (first admin)
        if (studyGroup.createdBy.toString() === userId && newRole !== 'admin') {
            throw new ConflictException('Cannot change the role of the group creator');
        }

        studyGroup.members[memberIndex].role = newRole;
        await studyGroup.save();

        return studyGroup.populate({
            path: 'members.userId createdBy',
            select: 'firstname lastname email'
        });
    }

    async removeUserFromStudyGroup(studyGroupId: string, userId: string) {
        const studyGroup = await this.studyGroupModel.findById(studyGroupId);
        if (!studyGroup) {
            throw new NotFoundException('Study group not found');
        }

        const userObjectId = new Types.ObjectId(userId);
        if (!studyGroup.members.some(member => member.userId.toString() === userId)) {
            throw new NotFoundException('User is not a member of this study group');
        }

        // Remove user from study group
        await this.studyGroupModel.findByIdAndUpdate(
            studyGroupId,
            { $pull: { members: userObjectId } }
        );

        // Remove study group from user's study groups
        await this.userModel.findByIdAndUpdate(
            userId,
            { $pull: { studyGroups: new Types.ObjectId(studyGroupId) } }
        );

        return this.studyGroupModel.findById(studyGroupId).populate('members createdBy');
    }
}
