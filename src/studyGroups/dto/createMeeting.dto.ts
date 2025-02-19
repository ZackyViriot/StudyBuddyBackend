import { IsString, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class CreateMeetingDto {
  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  startTime: string;

  @IsString()
  @IsNotEmpty()
  endTime: string;

  @IsEnum(['online', 'in-person', 'hybrid'])
  meetingType: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsOptional()
  createdBy?: string;

  @IsOptional()
  studyGroupId?: string;
} 