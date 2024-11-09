import { Module } from "@nestjs/common";
import { EventController } from "./event.controller";
import { EventService } from "./event.service";
import { MongooseModule } from "@nestjs/mongoose";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { EventSchema } from "./schemas/event.schema";

@Module({
    imports: [
        PassportModule.register({defaultStrategy:'jwt'}),
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: config.get<string | number>('JWT_EXPIRES') },
            })
        }),
        MongooseModule.forFeature([{name: 'Event',schema:EventSchema}])
    ],
    controllers: [EventController],
    providers: [EventService,ConfigService],
})

export class EventModule {}