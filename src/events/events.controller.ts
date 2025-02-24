import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../users/schemas/user.schema';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  async create(@Body() createEventDto: CreateEventDto, @GetUser() user: User) {
    if (!user || !user._id) {
      throw new UnauthorizedException('User not authenticated');
    }

    try {
      // Convert user._id to string if it's an ObjectId
      const ownerId = typeof user._id === 'object' ? user._id.toString() : user._id;
      createEventDto.owner = ownerId;
      
      const createdEvent = await this.eventsService.create(createEventDto);
      return createdEvent;
    } catch (error) {
      console.error('Error creating event:', error);
      throw new BadRequestException('Failed to create event: ' + error.message);
    }
  }

  @Get()
  async findAll(@GetUser() user: User) {
    return this.eventsService.findByUser(user._id.toString());
  }

  @Get('team/:teamId')
  async findByTeam(@Param('teamId') teamId: string) {
    return this.eventsService.findByTeam(teamId);
  }

  @Get('study-group/:studyGroupId')
  async findByStudyGroup(@Param('studyGroupId') studyGroupId: string) {
    return this.eventsService.findByStudyGroup(studyGroupId);
  }

  @Put(':id/complete')
  async complete(@Param('id') id: string) {
    return this.eventsService.update(id, { completed: true });
  }

  @Put(':id/clear')
  async clearEvent(@Param('id') id: string) {
    return this.eventsService.update(id, { cleared: true });
  }

  @Put(':id/unclear')
  async unclearEvent(@Param('id') id: string) {
    return this.eventsService.update(id, { cleared: false });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }
} 