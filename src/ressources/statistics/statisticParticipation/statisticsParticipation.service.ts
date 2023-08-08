import {BadRequestException, Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {DeepPartial, EntityManager, MoreThan, Not, Repository} from "typeorm";
import {CustomCrudService} from "../../../_common/CustomCrudService";
import {StatisticsParticipation} from "./statisticsParticipation.entity";
import {CreateManyDto, CrudRequest} from "@nestjsx/crud";
import {promiseAllSequentially} from "../../../_common/promiseAllSequentially";
import {Member} from "../../members/member.entity";
import {InjectDataSource} from "@nestjs/typeorm/dist/common/typeorm.decorators";
import {DataSource} from "typeorm/data-source/DataSource";
import {plainToInstance} from "class-transformer";
import {DeleteManyStatisticsParticipations} from "./dto/DeleteManyStatisticsParticipations";
import {StatisticsEntry} from "../statisticsEntry/statisticsEntry.entity";
import {DeletionProtocol} from "../deletionProtocol/deletionProtocol.entity";
import {isAnniversary} from "../anniversaries/isAnniversary";
import {Anniversary} from "../anniversaries/anniversary.entity";
import {SCondition} from "@nestjsx/crud-request/lib/types";
import {FindOptionsWhere} from "typeorm/find-options/FindOptionsWhere";

@Injectable()
export class StatisticsParticipationService extends CustomCrudService<StatisticsParticipation> {
    constructor(
        @InjectRepository(StatisticsParticipation) repo: Repository<StatisticsParticipation>,
        @InjectDataSource() private readonly dataSource: DataSource,
    ) {
        super(repo);
    }

    async createOne(req: CrudRequest, dto: DeepPartial<StatisticsParticipation>): Promise<StatisticsParticipation> {
        const {memberId, statisticsEntryId} = dto;

        const existingParticipation = await this.findOne({
            where: {statisticsEntryId, memberId}
        });

        if (existingParticipation) {
            return existingParticipation
        }

        return this.dataSource.transaction(async entityManager => {
            const statisticEntry: StatisticsEntry = await entityManager.findOne(StatisticsEntry, {where: {id: statisticsEntryId}})

            if (!statisticEntry) {
                throw new BadRequestException("related statistic entry does not exists")
            }

            if (statisticEntry.isNotInPast()) {
                throw new BadRequestException("related statistic entry must be in past")
            }

            const member = await entityManager.findOneBy(Member, {memberId: memberId});

            if (!member) {
                throw new BadRequestException("related member does not exists")
            }

            const updatedMember = await entityManager.save(Member, member.increasePerformanceCount());

            const participationToSave = plainToInstance(StatisticsParticipation, {
                memberId: memberId,
                statisticsEntryId: statisticsEntryId,
                performanceCount: updatedMember.performanceCount,
            })

            if (isAnniversary(participationToSave.performanceCount)) {
                await saveCorrespondingAnniversary(entityManager, participationToSave)
            }

            return await entityManager.save(StatisticsParticipation, participationToSave);
        });
    }

    async createMany(req: CrudRequest, dto: CreateManyDto<DeepPartial<StatisticsParticipation>>): Promise<StatisticsParticipation[]> {
        return promiseAllSequentially(dto.bulk, single => this.createOne(req, single));
    }

    async deleteOne(req: CrudRequest): Promise<StatisticsParticipation> {
        const whereCondition = convertSConditionPlainObject(req.parsed.search)
        const current = await this.repo.findOneBy(whereCondition);
        if (!current) {
            throw new BadRequestException("related statistic entry does not exists")
        }
        return this.dataSource.transaction(async entityManager => {
            return deleteStatisticsParticipation(entityManager, current, req.parsed.authPersist as Member)
        });
    }

    async deleteMany(req: CrudRequest, dto: DeleteManyStatisticsParticipations): Promise<StatisticsParticipation[]> {
        return await this.dataSource.transaction(async entityManager => {
            return promiseAllSequentially(dto.bulk, async (statisticsEntryId) => {
                const whereCondition = convertSConditionPlainObject(req.parsed.search)
                const current = await entityManager.findOneBy(StatisticsParticipation, {id: statisticsEntryId, ...whereCondition});
                if (!current) {
                    throw new BadRequestException("related statistics participation does not exists")
                }
                return await deleteStatisticsParticipation(entityManager, current, req.parsed.authPersist as Member);
            })
        });
    }
}

/**
 * be carefully!! this is a quite dirty hack
 * @param searchExpression
 */
function convertSConditionPlainObject(searchExpression: SCondition): FindOptionsWhere<StatisticsParticipation> {
    const relevantConditions = searchExpression.$and
    return relevantConditions.reduce((acc, condition) => {
        Object.keys(condition).forEach(key => {
            if (key.includes(".")) {
                const keys = key.split(".")
                acc[keys[0]] = {
                    [keys[1]]: condition[key]
                }
            } else {
                const value = condition[key]
                if (typeof value === 'object' && value !== null) {
                    acc[key] = Object.values(value)[0]
                } else {
                    acc[key] = value
                }
            }
        })

        return acc
    }, {}) as FindOptionsWhere<StatisticsParticipation>
}

async function deleteStatisticsParticipation(entityManager: EntityManager, participationToDelete: StatisticsParticipation, callingMember: Member) {
    await decreasePerformanceCountOfMember(entityManager, participationToDelete.memberId)

    if (isAnniversary(participationToDelete.performanceCount)) {
        await deleteCorrespondingAnniversary(entityManager, participationToDelete)
    }
    await updateAllNewerStatisticsParticipations(entityManager, participationToDelete)

    const removeResult = await entityManager.remove(participationToDelete)
    await writeDeletionProtocol(entityManager, removeResult, callingMember)

    return removeResult
}

async function decreasePerformanceCountOfMember(entityManager: EntityManager, memberId: number): Promise<Member> {
    const member = await entityManager.findOneBy(Member, {memberId: memberId});
    if (!member) {
        throw new BadRequestException("related member does not exists")
    }
    return entityManager.save(Member, member.decreasePerformanceCount());
}

async function writeDeletionProtocol(entityManager: EntityManager, statisticsParticipation: StatisticsParticipation, callingMember: Member) {
    await entityManager.save(DeletionProtocol, plainToInstance(DeletionProtocol, {
        memberId: statisticsParticipation.memberId,
        statisticsEntryId: statisticsParticipation.statisticsEntryId,
        performanceCount: statisticsParticipation.performanceCount,
        deletingMemeberId: callingMember.memberId,
        deletingMemeberName: callingMember.getFullName(),
    }))
}

async function updateAllNewerStatisticsParticipations(entityManager: EntityManager, participationToDelete: StatisticsParticipation): Promise<void> {
    const allNewerStatisticsParticipations = await entityManager
        .findBy(StatisticsParticipation, {
            id: Not(participationToDelete.id),
            memberId: participationToDelete.memberId,
            creationDate: MoreThan(participationToDelete.creationDate)
        })

    await promiseAllSequentially(allNewerStatisticsParticipations, async (statisticsParticipation: StatisticsParticipation) => {
        if (isAnniversary(statisticsParticipation.performanceCount)) {
            await deleteCorrespondingAnniversary(entityManager, statisticsParticipation)
        }

        const updatedStatisticsParticipation = await entityManager.save(StatisticsParticipation, statisticsParticipation.decreasePerformanceCount())

        if (isAnniversary(updatedStatisticsParticipation.performanceCount)) {
            await saveCorrespondingAnniversary(entityManager, updatedStatisticsParticipation)
        }
    })
}

async function deleteCorrespondingAnniversary(entityManager: EntityManager, statisticsParticipation: StatisticsParticipation) {
    return entityManager.delete(Anniversary, {
        statisticsEntryId: statisticsParticipation.statisticsEntryId,
        memberId: statisticsParticipation.memberId,
        performanceCount: statisticsParticipation.performanceCount
    })
}

async function saveCorrespondingAnniversary(entityManager: EntityManager, statisticsParticipation: StatisticsParticipation) {
    return entityManager.save(Anniversary, {
        statisticsEntryId: statisticsParticipation.statisticsEntryId,
        memberId: statisticsParticipation.memberId,
        performanceCount: statisticsParticipation.performanceCount
    })
}
