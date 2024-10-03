import { Prop,Schema, SchemaFactory } from "@nestjs/mongoose";



@Schema({
    timestamps: true
})

export class User {
    @Prop()
    email:string

    @Prop()
    username:string

    @Prop()
    password:string

    @Prop()
    confirmPassword:string
}


export const UserSchema = SchemaFactory.createForClass(User)