import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from "./user/user.module";
import { StudyGroupModule } from "./studyGroup/studyGroup.module";
import { ChatModule } from "./chat/chat.module";
import { EventModule } from "./events/event.module";


@Module({
  imports: [ConfigModule.forRoot({
    envFilePath: '.env',
    isGlobal: true,
  })
    , MongooseModule.forRoot('mongodb+srv://zackyviriot987:Zana1954!@studybuddycluster.tdu86.mongodb.net/?retryWrites=true&w=majority&appName=StudyBuddyCluster'), AuthModule,UserModule,StudyGroupModule,ChatModule,EventModule],
  controllers: [AppController],
  providers: [AppService]
})


export class AppModule {}