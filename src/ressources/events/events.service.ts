import {Injectable} from '@nestjs/common';
import {Event} from "./event.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {TypeOrmCrudService} from "@nestjsx/crud-typeorm";
import {In, MoreThan, Not} from "typeorm";
import {IcsService} from "../../ics/ics.service";
import {Cron, CronExpression} from "@nestjs/schedule";
import {FindOneOptions} from "typeorm/find-options/FindOneOptions";
import {ApplicationLogger} from "../../logger/application-logger.service";

@Injectable()
export class EventsService extends TypeOrmCrudService<Event> {

    constructor(
        @InjectRepository(Event) repo,
        private readonly icsService: IcsService,
        private readonly logger: ApplicationLogger) {
        super(repo);
        this.logger.setContext(EventsService.name)
    }

    findOneOrFail(options?: FindOneOptions<Event>){
        return this.repo.findOneOrFail(options)
    }

    @Cron(CronExpression.EVERY_HOUR)
    async importEventsFromWebsite() {
        let newEvents = await this.icsService.downloadEvents();
        await Promise.all(newEvents.map(newEvent => this.insertOrUpdateEvent(newEvent)));

        let onlyWpIds = newEvents.map(event => event.wpId);

        if (onlyWpIds.length > 0) {
            await this.deleteEventsWhichAreInFutureButNotInWpIdList(onlyWpIds);
        }
    }

    private async insertOrUpdateEvent(newEvent: Event) {
        if (!newEvent.wpId) {
            this.logger.error("Fehler keine WpId: " + newEvent.eventName);
            return;
        }

        try {
            let currentEvent = await this.repo.findOne({wpId: newEvent.wpId});

            if (currentEvent === undefined) {
                return await this.repo.save(newEvent);
            }

            if (!currentEvent.equals(newEvent)) {
                newEvent.eventId = currentEvent.eventId;
                return await this.repo.save(newEvent);
            }

        } catch (e) {
            this.logger.error("Fehler beim Insert/Update eines Events mit WpId: " + newEvent.wpId, e.stack);
        }
    }

    private async deleteEventsWhichAreInFutureButNotInWpIdList(wpIds: number[]): Promise<Event[]> {
        let now = new Date();
        let eventsToDelete: Event[] = await this.find({
                where: {
                    wpId: Not(In(wpIds)),
                    startDate: MoreThan(now),
                    isPublic: true
                }
            }
        );

        return await this.repo.remove(eventsToDelete);
    }
}
