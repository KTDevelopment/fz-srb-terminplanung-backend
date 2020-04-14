import {Module} from '@nestjs/common';
import {ParticipationStatesService} from './participation-states.service';
import {ParticipationStatesController} from './participation-states.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {ParticipationState} from "./participation-state.entity";

@Module({
    imports: [TypeOrmModule.forFeature([ParticipationState])],
    controllers: [ParticipationStatesController],
    providers: [ParticipationStatesService],
    exports: [ParticipationStatesService]
})
export class ParticipationStatesModule {
}
