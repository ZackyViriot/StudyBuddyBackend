import { IsString, IsNotEmpty, IsOptional, IsArray, ArrayNotEmpty, ArrayMinSize } from 'class-validator';



export class CreateStudyGroupDto {
    @IsString()
    @IsNotEmpty()
    name:string

    @IsString()
    @IsNotEmpty()
    meetingType:string;


    @IsArray()
    @ArrayNotEmpty()
    @ArrayMinSize(1)
    @IsString({ each: true }) // Validate each item in the array as a string
    meetingDays: string[];

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