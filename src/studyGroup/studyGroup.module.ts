import {Module} from '@nestjs/common';
import { StudyGroupController } from './studyGroup.controller';
import {StudyGroupService} from './studyGroup.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { StudyGroupSchema } from './schemas/studyGroup.schema';


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
        MongooseModule.forFeature([{name: 'StudyGroup',schema:StudyGroupSchema}])
    ],
    controllers: [StudyGroupController],
    providers: [StudyGroupService,ConfigService],
})

export class StudyGroupModule {}