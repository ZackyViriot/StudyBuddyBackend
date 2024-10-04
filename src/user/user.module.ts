import { Module } from "@nestjs/common";
import { UsersContoller } from "./user.controller";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { MongooseModule,Schema } from "@nestjs/mongoose";
import { UserSchema } from "src/auth/schemas/user.schema";
import { UsersService } from "./user.service";



@Module({
    imports:[
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory:(config: ConfigService) => {
              return { 
                secret: config.get<string>('JWT_SECRET'),
                signOptions: {
                  expiresIn : config.get<string | number >("JWT_EXPIRES")
                },
              };
            },
          }),
          MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])
    ],
   
      controllers: [UsersContoller],
      providers:[UsersService,ConfigService]


})

export class UserModule{}