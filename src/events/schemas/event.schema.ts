import {Prop,Schema,SchemaFactory} from '@nestjs/mongoose';
import {Document,Types} from 'mongoose';


export type EventDocument = Event & Document;


@Schema({timestamps:true})
export class Event {
    @Prop({required:true})
    title:string;

    @Prop()
    description?:string;

    @Prop({required:true})
    start:Date;

    @Prop({required:true})
    end:Date;

    

    @Prop({default: "#2196f3"})
    color?:string;

    @Prop({default:'busy'})
    status:string

    @Prop()
    userId:string;


}

export const EventSchema = SchemaFactory.createForClass(Event);