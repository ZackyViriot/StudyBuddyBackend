import { IsString, IsEnum, IsDate, IsArray, ArrayMinSize, IsNotEmpty, IsOptional, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';
import { MemberRole, Member } from '../team.schema';
import { ValidateNested } from 'class-validator';

export enum TeamMemberRole {
    ADMIN = 'admin',
    MODERATOR = 'moderator',
    MEMBER = 'member'
}

// need the dto for the goal and task 
export class CreateGoalDto {
    @IsString()
    @IsNotEmpty()
    title: string;


    @IsString()
    @IsOptional()
    description?: string;

    @IsDate()
    @Type(() => Date)
    targetDate: Date;

    @IsEnum(['active', 'achieved'])
    status: 'active' | 'achieved' = 'active';
}

export class CreateTaskDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsDate()
    @Type(() => Date)
    dueDate: Date;

    @IsEnum(['pending', 'in-progress', 'completed'])
    status: 'pending' | 'in-progress' | 'completed' = 'pending';

    @IsString()
    @IsNotEmpty()
    assignedTo: Types.ObjectId;
}

export class CreateMemberDto {
    @IsMongoId()
    @IsNotEmpty()
    userId: Types.ObjectId;

    @IsEnum(TeamMemberRole)
    @IsNotEmpty()
    role: TeamMemberRole;
}

export class CreateTeamDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsMongoId()
    @IsNotEmpty()
    createdBy: Types.ObjectId;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateGoalDto)
    goals?: CreateGoalDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateTaskDto)
    tasks?: CreateTaskDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateMemberDto)
    members?: CreateMemberDto[];
}