import {Injectable,NotFoundException} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model,Types} from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from "@nestjs/config";
import { CreateEventDto } from './dto/createEvent.dto';
import { Event } from './schemas/event.schema';
import { UpdateEventDto } from './dto/updateEvent.dto';

@Injectable()
export class EventService {
    constructor(
        @InjectModel(Event.name) private readonly event: Model<Event>,
        private readonly jwtService:JwtService,
        private readonly configService:ConfigService
    ){}


    async create(createEventDto:CreateEventDto): Promise <{token:string}>{
        const {title,description,start,end,color,status,userId} = createEventDto;
        const event = await this.event.create({
            title,
            description,
            start,
            end,
            color,
            status,
            userId,
        })

        const token = this.jwtService.sign(
            {id:event._id},
            {expiresIn:'1d'}
        );

        return {token};
    }

    async update(id:string,updateEventDto:CreateEventDto):Promise<Event>{
        const event = await this.event.findById(id).exec();
        if(!event){
            throw new Error("Event not found")
        }

        Object.assign(event,updateEventDto)
        await event.save();
        return event;
    }

    async findAll(): Promise<Event[]>{
        return this.event.find().exec();
    }


    async searchByTitle(title:string):Promise<Event[]>{
        return this.event.find({eventTitle: {$regex: new RegExp(title,'i')}}).exec();
    }

    async getByUserId(userId:string): Promise<Event[]>{
        return this.event.find({userId}).exec();
    }

    async getById(id:string):Promise<Event>{
        return this.event.findById(id).exec();
    }

    async deleteById(id:string): Promise<{message:string}>{
        const event = await this.event.findById(id).exec();
        if(!event){
            throw new Error("Event not found")
        }

        await this.event.findByIdAndDelete(id).exec();
        return {message:"Event deleted successfully"}
    }
  
    
}