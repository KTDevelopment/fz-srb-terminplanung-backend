import {Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Participation} from "./participation.entity";
import {CreateManyDto, CrudRequest} from "@nestjsx/crud";
import {DeepPartial, EntityManager} from "typeorm";
import {MembersService} from "../members/members.service";
import {EventsService} from "../events/events.service";
import {ParticipationStatesService} from "./participation-states/participation-states.service";
import {plainToClass} from "class-transformer";
import {STATE__HAS_NOT_PARTICIPATED, STATE__HAS_PARTICIPATED} from "./participation-states/participation-state.entity";
import {Member} from "../members/member.entity";
import {promiseAllSequentially} from "../../_common/promiseAllSequentially";
import {isAnniversary} from "../anniversaries/isAnniversary";
import {Anniversary} from "../anniversaries/anniversary.entity";
import {EventBus} from "@nestjs/cqrs";
import {SendFirebaseMessageEvent} from "../../fcm/events/send-firebase-message.event";
import {Event} from "../events/event.entity";
import {InjectDataSource} from "@nestjs/typeorm/dist/common/typeorm.decorators";
import {DataSource} from "typeorm/data-source/DataSource";
import {CustomCrudService} from "../../_common/CustomCrudService";

@Injectable()
export class ParticipationsService extends CustomCrudService<Participation> {
    constructor(
        @InjectRepository(Participation) repo,
        @InjectDataSource() private readonly dataSource: DataSource,
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
        const oldStateId = participation.stateId;
        delete participation.participationState;
        participation.stateId = dto.stateId;

        let response = await this.dataSource.transaction(async entityManager => {
            if (participation.event.category.includes('AUFTRITT')) {
                await ParticipationsService.handlePerformanceCountAndAnniversary(participation, oldStateId, entityManager);
            }
            return await entityManager.save(Participation, participation);
        });

        this.eventBus.publish(plainToClass(SendFirebaseMessageEvent, {
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

    async deleteOne(req: CrudRequest) {
        const deleted = await super.deleteOne(req);
        if (deleted) {
            await this.dataSource.transaction(async entityManager => {
                const event = await entityManager.findOneBy(Event, {eventId: deleted.eventId});
                if (event.category.includes('AUFTRITT') && deleted.hasState(STATE__HAS_PARTICIPATED)) {
                    const member = await entityManager.findOneBy(Member, {memberId: deleted.memberId});
                    if (isAnniversary(member.performanceCount)) {
                        await entityManager.delete(Anniversary, {
                            eventId: deleted.eventId,
                            memberId: deleted.memberId,
                            performanceCount: member.performanceCount
                        })
                    }
                    await entityManager.save(Member, member.decreasePerformanceCount());
                }
            });
        }
        return deleted;
    }

    async findDetailedParticipation(memberId: number, eventId: number): Promise<Participation> {
        let result = await this.findOne({
            relations: ['member', 'participationState', 'event'],
            where: {eventId, memberId}
        });

        if (!result) {
            return this.defaultParticipation(memberId, eventId)
        }

        result.member = await this.membersService.findDetailedMember(result.memberId);

        return result
    }

    private static async handlePerformanceCountAndAnniversary(participation: Participation, oldStateId: number, entityManager: EntityManager) {
        if (participation.hasState(STATE__HAS_PARTICIPATED)) {
            const member = await entityManager.save(Member, participation.member.increasePerformanceCount());
            if (isAnniversary(member.performanceCount)) {
                await entityManager.save(Anniversary, {
                    eventId: participation.eventId,
                    memberId: participation.memberId,
                    performanceCount: member.performanceCount
                })
            }
        }
        if (participation.hasState(STATE__HAS_NOT_PARTICIPATED) && oldStateId === STATE__HAS_PARTICIPATED) {
            if (isAnniversary(participation.member.performanceCount)) {
                await entityManager.delete(Anniversary, {
                    memberId: participation.member.memberId,
                    eventId: participation.eventId
                })
            }
            await entityManager.save(Member, participation.member.decreasePerformanceCount());
        }
    }

    private async defaultParticipation(memberId: number, eventId: number): Promise<Participation> {
        let member = await this.membersService.findDetailedMember(memberId);
        let participationState = await this.participationStatesService.findOneOrFail({where: {stateId: 0}});
        let event = await this.eventsService.findOneOrFail({where: {eventId}});
        return plainToClass(Participation, {
            stateId: participationState.stateId,
            eventId: event.eventId,
            memberId: member.memberId,
            member,
            participationState,
            event,
        });
    }
}
