import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class JoinTeamDto {
    @IsString()
    @IsNotEmpty()
    joinCode: string;

    @IsMongoId()
    @IsNotEmpty()
    userId: Types.ObjectId;
} 