import {Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Participation} from "./participation.entity";
import {CreateManyDto, CrudRequest} from "@nestjsx/crud";
import {DeepPartial, Repository} from "typeorm";
import {MembersService} from "../members/members.service";
import {EventsService} from "../events/events.service";
import {ParticipationStatesService} from "./participation-states/participation-states.service";
import {plainToInstance} from "class-transformer";
import {promiseAllSequentially} from "../../_common/promiseAllSequentially";
import {EventBus} from "@nestjs/cqrs";
import {SendFirebaseMessageEvent} from "../../fcm/events/send-firebase-message.event";
import {CustomCrudService} from "../../_common/CustomCrudService";

@Injectable()
export class ParticipationsService extends CustomCrudService<Participation> {
    constructor(
        @InjectRepository(Participation) repo: Repository<Participation>,
        private readonly membersService: MembersService,
        private readonly eventsService: EventsService,
        private readonly participationStatesService: ParticipationStatesService,
        private readonly eventBus: EventBus
    ) {
        super(repo);
    }

    async createOne(req: CrudRequest, dto: DeepPartial<Participation>): Promise<Participation> {
        const {memberId, eventId} = dto;

        const participation = await this.findDetailedParticipation(memberId, eventId);
        delete participation.participationState;
        participation.stateId = dto.stateId;

        const response = await this.repo.save(participation);

        this.eventBus.publish(plainToInstance(SendFirebaseMessageEvent, {
            newStateId: response.stateId,
            callingMember: req.parsed.authPersist,
            changedMember: participation.member,
            event: participation.event,
        }));

        return response;
    }

    async createMany(req: CrudRequest, dto: CreateManyDto<DeepPartial<Participation>>): Promise<Participation[]> {
        return promiseAllSequentially(dto.bulk, single => this.createOne(req, single));
    }

    async findDetailedParticipation(memberId: number, eventId: number): Promise<Participation> {
        const result = await this.findOne({
            relations: ['member', 'participationState', 'event'],
            where: {eventId, memberId}
        });

        if (!result) {
            return this.defaultParticipation(memberId, eventId)
        }

        result.member = await this.membersService.findDetailedMember(result.memberId);

        return result
    }

    private async defaultParticipation(memberId: number, eventId: number): Promise<Participation> {
        const member = await this.membersService.findDetailedMember(memberId);
        const participationState = await this.participationStatesService.findOneOrFail({where: {stateId: 0}});
        const event = await this.eventsService.findOneOrFail({where: {eventId}});
        return plainToInstance(Participation, {
            stateId: participationState.stateId,
            eventId: event.eventId,
            memberId: member.memberId,
            member,
            participationState,
            event,
        });
    }
}
