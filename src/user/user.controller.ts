
import {Controller,Get,Param,UseGuards,NotFoundException} from '@nestjs/common';
import { UsersService } from './user.service';
import { JwtAuthGuard } from 'src/auth/JwtAuthGuard';




@Controller("users")
export class UsersContoller {
    constructor(private readonly usersService:UsersService){}


    @UseGuards(JwtAuthGuard)
    @Get("/:id")
    async getUserById(@Param('id') id:string){
        const user = await this.usersService.findById(id);
        if(!user){
            throw new NotFoundException("user not found")
        }
        return user;
    }
}