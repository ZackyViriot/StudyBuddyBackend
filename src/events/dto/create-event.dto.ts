import { IsString, IsNotEmpty, IsDate, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { EventType } from '../event.schema';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  endDate: Date;

  @IsEnum(EventType)
  @IsOptional()
  type?: EventType = EventType.OTHER;

  @IsString()
  @IsOptional()
  customType?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  owner?: string;

  @IsString()
  @IsOptional()
  teamId?: string;

  @IsString()
  @IsOptional()
  studyGroupId?: string;

  @IsBoolean()
  @IsOptional()
  completed?: boolean = false;

  @IsBoolean()
  @IsOptional()
  cleared?: boolean = false;

  @IsString()
  @IsOptional()
  source?: string = 'personal';
} 