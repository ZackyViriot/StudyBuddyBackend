import {Injectable,NotFoundException} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import { User } from 'src/auth/schemas/user.schema';
// have to make mind map 
//user journey 


@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>
    ){}


    async findById(id:string): Promise<User>{
        const user = await this.userModel.findById(id).exec();
        if(!user){
            throw new NotFoundException("User not found")
        }
        return user;
    }
}