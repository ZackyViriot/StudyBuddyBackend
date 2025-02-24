import { IsString, IsNotEmpty } from 'class-validator';

export class JoinStudyGroupDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
} 