import {Module} from '@nestjs/common';
import {ParticipationsController} from './participations.controller';
import {ParticipationsService} from './participations.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Participation} from "./participation.entity";
import {ParticipationChangeRequestValidator} from "./validation/ParticipationChangeRequestValidator";
import {EventsModule} from "../events/events.module";
import {ParticipationStatesModule} from "./participation-states/participation-states.module";
import {MembersModule} from "../members/members.module";
import {CqrsModule} from "@nestjs/cqrs";

@Module({
    imports: [
        CqrsModule,
        TypeOrmModule.forFeature([Participation]),
        EventsModule,
        ParticipationStatesModule,
        MembersModule
    ],
    controllers: [ParticipationsController],
    providers: [ParticipationsService, ParticipationChangeRequestValidator]
})
export class ParticipationsModule {
}
