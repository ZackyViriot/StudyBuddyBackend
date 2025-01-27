import { IsEmail, IsNotEmpty, IsString, IsOptional } from "class-validator";

export class CreateUserDto {

    @IsNotEmpty()
    @IsString()
    firstname:string;

    @IsNotEmpty()
    @IsString()
    lastname:string;

    @IsNotEmpty()
    @IsEmail()
    email:string;

    @IsNotEmpty()
    @IsString()
    password:string;
}

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsString()
    school?: string;

    @IsOptional()
    @IsString()
    major?: string;

    @IsOptional()
    @IsString()
    year?: string;

    @IsOptional()
    @IsString()
    bio?: string;

    @IsOptional()
    @IsString()
    studyPreferences?: string;

    @IsOptional()
    @IsString()
    availability?: string;

    @IsOptional()
    @IsString()
    profilePicture?: string;
}

export class LoginUserDto {
    @IsNotEmpty()
    @IsEmail()
    email:string;

    @IsNotEmpty()
    @IsString()
    password:string;
}