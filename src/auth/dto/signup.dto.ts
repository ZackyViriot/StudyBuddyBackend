import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';



export class SignUpDto {
    @IsNotEmpty()
    @IsEmail({},{message:"Please enter a correct email"})
    readonly email: string;


    @IsNotEmpty()
    @IsString()
    readonly username:string;

    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    readonly password: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    readonly confirmPassword:string;
}