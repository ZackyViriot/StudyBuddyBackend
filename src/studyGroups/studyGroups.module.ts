import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StudyGroupsController } from './studyGroups.controller';
import { StudyGroupsService } from './studyGroups.service';
import { StudyGroup, StudyGroupSchema } from './studyGroup.schema';
import { User, UserSchema } from '../users/user.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: StudyGroup.name, schema: StudyGroupSchema },
            { name: User.name, schema: UserSchema }
        ])
    ],
    controllers: [StudyGroupsController],
    providers: [StudyGroupsService],
    exports: [StudyGroupsService]
})
export class StudyGroupsModule {} 