import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventType } from './event.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<Event>
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    const createdEvent = new this.eventModel(createEventDto);
    return createdEvent.save();
  }

  async findAll(): Promise<Event[]> {
    return this.eventModel.find().populate('owner').exec();
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventModel.findById(id).populate('owner').exec();
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    const updatedEvent = await this.eventModel
      .findByIdAndUpdate(id, updateEventDto, { new: true })
      .populate('owner')
      .exec();
    if (!updatedEvent) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return updatedEvent;
  }

  async remove(id: string): Promise<void> {
    const result = await this.eventModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
  }

  async findByUser(userId: string): Promise<Event[]> {
    return this.eventModel
      .find({ owner: userId })
      .populate('owner')
      .exec();
  }

  async findByTeam(teamId: string): Promise<Event[]> {
    return this.eventModel
      .find({ 
        teamId,
        type: EventType.MEETING 
      })
      .populate('owner')
      .exec();
  }

  async findByStudyGroup(studyGroupId: string): Promise<Event[]> {
    return this.eventModel
      .find({ 
        studyGroupId,
        type: EventType.STUDY 
      })
      .populate('owner')
      .exec();
  }
} 