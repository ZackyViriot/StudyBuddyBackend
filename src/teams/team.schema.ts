import {Prop,Schema,SchemaFactory} from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../users/user.schema';

export type TeamDocument = Document & Team;

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
    _id: Types.ObjectId;
    title: string;
    description?: string;
    dueDate: Date;
    completed: boolean;
    status: 'pending' | 'in_progress' | 'completed';
    assignedTo: Types.ObjectId[];
}

export interface TeamMeeting {
    _id: Types.ObjectId;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    location?: string;
    createdBy: Types.ObjectId;
}

@Schema()
export class Team {
    @Prop({required:true})
    name:string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
    createdBy: Types.ObjectId;

    @Prop({ required: true, type: [{
        userId: { type: Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['admin', 'moderator', 'member'], required: true }
    }] })
    members: Array<{ userId: Types.ObjectId; role: string }>;

    @Prop({
        type: [{
            title: { type: String, required: true },
            description: { type: String, required: false },
            targetDate: { type: Date, required: true },
            status: {
                type: String,
                enum: ['active', 'achieved'],
                default: 'active',
                required: true
            },
            progress: { type: Number, default: 0, min: 0, max: 100 }
        }],
        default: []
    })
    goals: TeamGoal[];

    @Prop([{
        type: {
            title: String,
            description: String,
            dueDate: Date,
            completed: Boolean,
            status: {
                type: String,
                enum: ['pending', 'in_progress', 'completed'],
                default: 'pending'
            },
            assignedTo: [{ type: Types.ObjectId, ref: 'User' }]
        }
    }])
    tasks: TeamTask[];

    @Prop([{
        type: {
            title: String,
            description: String,
            startDate: Date,
            endDate: Date,
            location: String,
            createdBy: { type: Types.ObjectId, ref: 'User' }
        }
    }])
    meetings: TeamMeeting[];

    //the team will also have its own chat 
    @Prop({ type: Types.ObjectId, ref: 'chat' })
    chatId?: Types.ObjectId;

    @Prop({ required: true, unique: true })
    joinCode: string;
}

export const TeamSchema = SchemaFactory.createForClass(Team);

