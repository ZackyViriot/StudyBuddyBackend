import {Prop,Schema,SchemaFactory} from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Types } from 'mongoose';
import { User } from '../users/user.schema';


export type TeamDocument = HydratedDocument<Team>;

//roles for team members
export type MemberRole = 'admin' | 'moderator' | 'member';
//interface for team members
export interface Member {
    userId:Types.ObjectId;
    role:MemberRole;
}

//define interface for team such as goals and task 
export interface TeamGoal {
    _id?: Types.ObjectId;
    title: string;
    description?: string;
    targetDate: Date;
    status: 'active' | 'achieved';
    progress?: number;
}

export interface TeamTask {
    _id?: Types.ObjectId;
    title: string;
    description?: string;
    dueDate: Date;
    status: 'pending' | 'in_progress' | 'completed';
    assignedTo: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}


@Schema()
export class Team {
    @Prop({required:true})
    name:string;

    @Prop({ required:true,type:Types.ObjectId,red:'User'})
    createdBy:Types.ObjectId;

    @Prop({required:true,type:[{
        userId:{type:Types.ObjectId,ref:'User',required:true},
        role:{type:String,enum:['admin','moderator','member'],required:true}
    }],default:[]})
    members:Member[];
    

    @Prop({
        type: [{
            title: {type:String, required:true},
            description: {type:String,required:false},
            targetDate: {type:Date,required:true},
            status: {
                type:String,
                enum: ['active','achieved'],
                default: 'active',
                required:true
            },
            progress: {type:Number, default: 0, min: 0, max: 100}
        }],
        default:[]
    })
    goals:TeamGoal[];

    @Prop({
        type: [{
            title: { type: String, required: true },
            description: { type: String, required: false },
            dueDate: { type: Date, required: true },
            status: { 
                type: String, 
                enum: ['pending', 'in_progress', 'completed'],
                default: 'pending',
                required: true 
            },
            assignedTo: { type: Types.ObjectId, ref: 'User', required: true },
            createdAt: { type: Date, default: Date.now },
            updatedAt: { type: Date }
        }],
        default: []
    })
    tasks: TeamTask[];

    //the team will also have its own chat 
    @Prop({type:Types.ObjectId,ref: 'chat'})
    chatId?:Types.ObjectId;

    @Prop({ required: true, unique: true })
    joinCode: string;
}

export const TeamSchema = SchemaFactory.createForClass(Team);

