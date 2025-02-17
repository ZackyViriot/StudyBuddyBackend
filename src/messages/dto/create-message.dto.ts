import { IsString, IsNotEmpty, IsEnum, IsOptional, IsArray } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  roomId: string;

  @IsEnum(['team', 'study-group'])
  roomType: 'team' | 'study-group';

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attachments?: string[];
} 