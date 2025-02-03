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
    title:string;
    description?:string;
    targetDate:Date;
    status:'active' | 'achieved'
}

export interface TeamTask {
    title:string;
    description?:string;
    dueDate:Date;
    status:'pending' | 'in-progress' | 'completed';
    assignedTo:Types.ObjectId;
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
            }

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
                enum: ['pending', 'in-progress', 'completed'],
                default: 'pending',
                required: true 
            },
            assignedTo: { type: Types.ObjectId, ref: 'User', required: true }
        }],
        default: []
    })
    tasks: TeamTask[];

    //the team will also have its own chat 
    @Prop({type:Types.ObjectId,ref: 'chat'})
    chatId?:Types.ObjectId;
}

export const TeamSchema = SchemaFactory.createForClass(Team);

