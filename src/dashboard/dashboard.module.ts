import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Team, TeamSchema } from '../teams/team.schema';
import { StudyGroup, StudyGroupSchema } from '../studyGroups/studyGroup.schema';
import { User, UserSchema } from '../users/user.schema';
import { Event, EventSchema } from '../events/event.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Team.name, schema: TeamSchema },
      { name: StudyGroup.name, schema: StudyGroupSchema },
      { name: User.name, schema: UserSchema },
      { name: Event.name, schema: EventSchema }
    ])
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService]
})
export class DashboardModule {} 