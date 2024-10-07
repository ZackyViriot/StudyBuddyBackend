import {IsString,IsNotEmpty,IsOptional,IsUrl} from 'class-validator';


export class CreateStudyGroupDto {
    @IsString()
    @IsNotEmpty()
    name:string

    @IsString()
    @IsNotEmpty()
    meetingType:string;


    @IsString()
    @IsNotEmpty()
    meetingDays:string

    @IsString()
    @IsNotEmpty()
    meetingLocation:string

    @IsString()
    @IsNotEmpty()
    major:String;

    @IsString()
    @IsNotEmpty()
    userId:string;
}