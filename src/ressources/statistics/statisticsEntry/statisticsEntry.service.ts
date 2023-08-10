import {BadRequestException, Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {StatisticsEntry} from "./statisticsEntry.entity";
import {Repository} from "typeorm";
import {CustomCrudService} from "../../../_common/CustomCrudService";
import {CreateFromEventDto} from "./dto/CreateFromEventDto";
import {InjectDataSource} from "@nestjs/typeorm/dist/common/typeorm.decorators";
import {DataSource} from "typeorm/data-source/DataSource";
import {AUFTRITT_MARKER, Event} from "../../events/event.entity";
import {promiseAllSequentially} from "../../../_common/promiseAllSequentially";
import {plainToInstance} from "class-transformer";

@Injectable()
export class StatisticsEntryService extends CustomCrudService<StatisticsEntry> {
    constructor(
        @InjectRepository(StatisticsEntry) repo: Repository<StatisticsEntry>,
        @InjectDataSource() private readonly dataSource: DataSource,) {
        super(repo);
    }

    async createFromEvent(dto: CreateFromEventDto): Promise<StatisticsEntry[]> {
        const event = await this.dataSource.getRepository(Event).findOne({where: {eventId: dto.eventId}})

        if (!event) {
            throw new BadRequestException(`given event does not exists`)
        }

        if (!event.isAuftritt()) {
            throw new BadRequestException(`statistics are only allowed for ${AUFTRITT_MARKER} right now`)
        }

        return this.dataSource.transaction(entityManager => {
            return promiseAllSequentially(dto.sectionIds, async (sectionId) => {
                try {
                    return await entityManager.save(plainToInstance(StatisticsEntry, {
                        name: dto.customName ? dto.customName : event.eventName,
                        locationString: event.createLocationString(),
                        date: event.endDate,
                        eventId: event.eventId,
                        sectionId: sectionId,
                        isProcessed: false,
                    }))
                } catch (e) {
                    throw new BadRequestException("requested creation is not valid")
                }
            })
        });
    }
}
