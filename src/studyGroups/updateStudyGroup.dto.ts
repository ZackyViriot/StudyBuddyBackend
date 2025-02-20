import { IsString, IsEnum, IsArray, IsOptional, IsMongoId } from 'class-validator';

export class UpdateStudyGroupDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(['online', 'in-person', 'hybrid'])
  meetingType?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  meetingDays?: string[];

  @IsOptional()
  @IsString()
  meetingLocation?: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsString()
  major?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  members?: string[];
}
