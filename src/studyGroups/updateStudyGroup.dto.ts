import { IsString, IsEnum, IsArray, IsOptional, IsMongoId } from 'class-validator';

export class UpdateStudyGroupDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(['In-Person', 'Online', 'Hybrid'])
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
  major?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  members?: string[];
}
