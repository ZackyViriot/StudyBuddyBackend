import { Controller, Post, Body, Get, Query, Param, Delete, Put, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { CreateEventDto } from './dto/createEvent.dto';
import { EventService } from './event.service';
import { JwtAuthGuard } from 'src/auth/JwtAuthGuard';
import { UpdateEventDto } from './dto/updateEvent.dto';



@Controller("Event")
export class EventController {
    constructor(private eventService: EventService) { }


    @Post()
    createEvent(@Body() createEventDto: CreateEventDto) {
        return this.eventService.create(createEventDto);
    }

    @Put(":id")
    async updateEvent(
        @Param("id") id: string,
        @Body() updateEventDto:CreateEventDto
    ){
        return this.eventService.update(id,updateEventDto);
    }

    @Get("all")
    getAllEvents(){
        return this.eventService.findAll();
    }

    @Get('search')
    searchEventByTitle(@Query('title') title:string){
        return this.eventService.searchByTitle(title);
    }


    @UseGuards(JwtAuthGuard)
    @Get('user')
    async getUserEvents(@Query('userId') userId:string){
        return this.eventService.getByUserId(userId);
    }

    @Get(":id")
    getEventInformationByEventId(@Param("id") id:string){
        return this.eventService.getById(id);
    }

    @Delete(":id")
    deleteEvent(@Param('id') id:string){
        return this.eventService.deleteById(id);
    }
}