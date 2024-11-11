// Import necessary decorators from NestJS
import { Controller, Post, Body, Get, UseGuards, Param } from '@nestjs/common';
// Controller: Marks class as a controller
// Post: HTTP POST decorator
// Body: Decorator to access request body
// Get: HTTP GET decorator (not used in this code)
// UseGuards: For implementing route guards (not used but imported)
// Param: For route parameters (not used but imported)

// Import the authentication service
import { AuthService } from './auth.service';
// This imports the service we looked at earlier

// Import Data Transfer Objects (DTOs)
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
// These define the expected shape of signup/login data

// Import JWT authentication guard
import { JwtAuthGuard } from './JwtAuthGuard';
// For protecting routes (imported but not used in this code)

@Controller('auth')  
// Decorator that marks this class as a controller
// 'auth' means all routes will be prefixed with /auth

export class AuthController {
    constructor(
        private authService: AuthService
    ){}
    // Injects the AuthService into this controller
    // This gives us access to the signup and login methods

    @Post('/signup')
    // Defines a POST endpoint at /auth/signup
    signUp(
        @Body() signUpDto: SignUpDto  // Decorator to extract and validate request body
    ): Promise<{token: string}> {  // Return type is a Promise containing a token
        return this.authService.signUp(signUpDto);
        // Simply forwards the request to the AuthService
    }

    @Post('/login')
    // Defines a POST endpoint at /auth/login
    login(
        @Body() loginDto: LoginDto  // Decorator to extract and validate request body
    ): Promise<{token: string}> {  // Return type is a Promise containing a token
        return this.authService.login(loginDto)
        // Simply forwards the request to the AuthService
    }
}