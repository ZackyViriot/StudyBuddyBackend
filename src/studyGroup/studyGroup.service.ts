import { Injectable,NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import {Model,Types} from 'mongoose';
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { CreateStudyGroupDto } from "./dto/createStudyGroup.dto";
import { StudyGroup } from "./schemas/studyGroup.schema";


@Injectable()
export class StudyGroupService {
    constructor(
        @InjectModel(StudyGroup.name) private readonly studyGroup: Model<StudyGroup>,
        private readonly jwtService:JwtService,
        private readonly configService:ConfigService
    ){}

    async create(createStudyGroupDto: CreateStudyGroupDto): Promise<{ token: string }> {
        const { name, meetingType, meetingLocation, meetingDays, major, userId } = createStudyGroupDto;
        
        // Create the new study group and automatically add the creator as a member
        const studyGroup = await this.studyGroup.create({
            name,
            meetingType,
            meetingLocation,
            meetingDays,
            major,
            userId,  // The creator of the group
            members: [userId],  // Automatically add the creator to the members array
        });
        
        const token = this.jwtService.sign(
            {id:studyGroup._id},
            {expiresIn: '1d'}
        );

        return {token}
    };

    async update(id:string, updateStudyGroupDto:CreateStudyGroupDto): Promise<StudyGroup>{
        const studyGroup = await this.studyGroup.findById(id).exec();


        if(!studyGroup){
            throw new Error("StudyGroup not found");
        }

        Object.assign(studyGroup,updateStudyGroupDto);
        await studyGroup.save();
        return studyGroup;
    }

    async findAll(): Promise<StudyGroup[]>{
        return this.studyGroup.find().exec();
    }

    async searchByTitle(title:string): Promise<StudyGroup[]>{
        return this.studyGroup.find({studyGroupTitle: {$regex: new RegExp(title, 'i')}}).exec();
    }

    async getByUserId(userId:string): Promise<StudyGroup[]> {
        return this.studyGroup.find({userId}).exec();
    }

    async getById(id:string): Promise<StudyGroup>{
        return this.studyGroup.findById(id).exec();
    }

    async deleteById(id:string): Promise<{message:string}>{
        const studyGroup = await this.studyGroup.findById(id).exec();
        if(!studyGroup){
            throw new Error("Study group not found");
        }

        await this.studyGroup.findByIdAndDelete(id).exec();
        return {message: "study group deleted successfully."}
    }


    //join group using memeber ids

    async joinGroup(id: string, userId: string): Promise<StudyGroup> {
        const studyGroup = await this.studyGroup.findById(id).exec();

        if (!studyGroup) {
            throw new NotFoundException("Study group not found");
        }

        const userObjectId = new Types.ObjectId(userId);

        if (!studyGroup.members.some(memberId => memberId.equals(userObjectId))) {
            studyGroup.members.push(userObjectId);
            await studyGroup.save();
        }

        return studyGroup;
    }

    async getUserStudyGroups(userId: string): Promise<StudyGroup[]> {
        const objectId = new Types.ObjectId(userId);
        return this.studyGroup.find({
            $or: [
                { userId: userId },  // Groups created by the user
                { members: objectId }  // Groups where the user is a member
            ]
        }).exec();
    }


}