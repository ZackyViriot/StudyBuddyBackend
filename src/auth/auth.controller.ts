import { AuthService } from './auth.service';
import { Controller, Post,Body, Get, UseGuards, Param } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/signup.dto';
import { JwtAuthGuard } from './JwtAuthGuard';

@Controller('auth')
export class AuthController {
    constructor(private  authService:AuthService){

    }


    @Post('/signup')
    signUp(@Body() signUpDto:SignUpDto):Promise<{token:string}>{
        return this.authService.signUp(signUpDto);
    }


    @Post('/login')
    login(@Body() loginDto: LoginDto): Promise<{token:string}> {
        return this.authService.login(loginDto)
    }

   

    
}
 