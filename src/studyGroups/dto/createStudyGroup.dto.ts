import { IsString, IsEnum, IsArray, ArrayMinSize, IsNotEmpty, IsOptional } from 'class-validator';
import { Types } from 'mongoose';
import { MemberRole, GroupMember } from '../studyGroup.schema';

export class CreateStudyGroupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(['online', 'in-person', 'hybrid'])
  meetingType: string;

  @IsArray()
  @ArrayMinSize(1)
  meetingDays: string[];

  @IsString()
  @IsNotEmpty()
  meetingLocation: string;

  @IsString()
  @IsNotEmpty()
  startTime: string;

  @IsString()
  @IsNotEmpty()
  endTime: string;

  @IsString()
  @IsNotEmpty()
  createdBy: string;

  @IsOptional()
  @IsString()
  joinCode?: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  course?: string;

  @IsOptional()
  @IsString()
  institution?: string;

  @IsOptional()
  @IsArray()
  members?: GroupMember[];
}
