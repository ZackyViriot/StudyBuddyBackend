import {Prop,Schema,SchemaFactory} from '@nestjs/mongoose';
import {Document,Schema as MongooseSchema} from 'mongoose';

@Schema({timestamps:true})
export class StudyGroup extends Document {

        @Prop()
        name:string;

        @Prop()
        //could be online or in person or both
        meetingType:string;

        @Prop()
        meetingDays:string;

        @Prop()
        meetingLocation:string;

        @Prop()
        major:string;

        @Prop()
        userId:string;

        //need to try to figure out a way to add multiple people to a study group the prop above will be the owner of the study group could hold the memebers in a array 
        @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }] })
        members: string[]; // Array of user IDs who joined the group
}


export const  StudyGroupSchema = SchemaFactory.createForClass(StudyGroup);