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
  meetingTime: string;

  @IsOptional()
  createdBy?: string;

  @IsOptional()
  @IsArray()
  members?: GroupMember[];
}
