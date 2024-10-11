import {Prop,Schema,SchemaFactory} from '@nestjs/mongoose';
import {Document,Types} from 'mongoose';


@Schema({timestamps:true})
export class ChatMessage {
    @Prop({type: Types.ObjectId, ref:'User', required: true})
    userId: Types.ObjectId;


    @Prop({type: Types.ObjectId, ref:'StudyGroup', required:true})
    studyGroupId: Types.ObjectId

    @Prop({ required: true })
    content: string;
  
}
export type ChatMessageDocument = ChatMessage & Document;
export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);