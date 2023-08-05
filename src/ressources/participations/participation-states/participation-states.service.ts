import {Injectable} from '@nestjs/common';
import {CustomCrudService} from "../../../_common/CustomCrudService";
import {InjectRepository} from "@nestjs/typeorm";
import {
    ParticipationState,
    STATE__ATTEND,
    STATE__DO_NOT_ATTEND,
    STATE__HAS_NOT_PARTICIPATED,
    STATE__HAS_PARTICIPATED,
    STATE__INVITATION_REQUEST_PENDING,
    STATE__INVITATION_REQUEST_REJECTED,
    STATE__INVITED,
    STATE__NOT_INVITED
} from "./participation-state.entity";
import {plainToInstance} from "class-transformer";
import {FindOneOptions} from "typeorm/find-options/FindOneOptions";

@Injectable()
export class ParticipationStatesService extends CustomCrudService<ParticipationState> {
    constructor(@InjectRepository(ParticipationState) repo) {
        super(repo);
    }

    findOneOrFail(options?: FindOneOptions<ParticipationState>) {
        return this.repo.findOneOrFail(options)
    }

    async insertParticipationStates() {
        await Promise.all(ParticipationStatesService.participationStates().map(async (participationState) => {
            if ((await this.repo.countBy({stateId: participationState.stateId})) === 0) {
                await this.repo.insert(participationState)
            }
        }));
    }

    private static participationStates() {
        return [
            plainToInstance(ParticipationState, {stateId: STATE__NOT_INVITED, stateName: 'not_invited'}),
            plainToInstance(ParticipationState, {stateId: STATE__INVITED, stateName: 'invited'}),
            plainToInstance(ParticipationState, {stateId: STATE__ATTEND, stateName: 'attend'}),
            plainToInstance(ParticipationState, {stateId: STATE__DO_NOT_ATTEND, stateName: 'do_not_attend'}),
            plainToInstance(ParticipationState, {
                stateId: STATE__INVITATION_REQUEST_PENDING,
                stateName: 'invitation_request_pending'
            }),
            plainToInstance(ParticipationState, {
                stateId: STATE__INVITATION_REQUEST_REJECTED,
                stateName: 'invitation_request_rejected'
            }),
            plainToInstance(ParticipationState, {stateId: STATE__HAS_PARTICIPATED, stateName: 'has_participated'}),
            plainToInstance(ParticipationState, {
                stateId: STATE__HAS_NOT_PARTICIPATED,
                stateName: 'has_not_participated'
            }),
        ]
    }
}
