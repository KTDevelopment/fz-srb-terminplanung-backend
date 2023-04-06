import {Injectable} from '@nestjs/common';
import {Event} from "./event.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {TypeOrmCrudService} from "@nestjsx/crud-typeorm";
import {In, MoreThan, Not} from "typeorm";
import {IcsService} from "../../ics/ics.service";
import {Cron, CronExpression} from "@nestjs/schedule";
import {FindOneOptions} from "typeorm/find-options/FindOneOptions";
import {ApplicationLogger} from "../../logger/application-logger.service";
import {GeoService} from "../../geo/geo.service";
import {AppException} from "../../_common/AppException";
import {promiseAllSequentially} from "../../_common/promiseAllSequentially";

@Injectable()
export class EventsService extends TypeOrmCrudService<Event> {

    constructor(
        @InjectRepository(Event) repo,
        private readonly icsService: IcsService,
        private readonly geoService: GeoService,
        private readonly logger: ApplicationLogger) {
        super(repo);
        this.logger.setContext(EventsService.name)
    }

    findOneOrFail(options?: FindOneOptions<Event>) {
        return this.repo.findOneOrFail(options)
    }

    @Cron(CronExpression.EVERY_HOUR)
    async importEventsFromWebsite() {
        const newEvents = await this.icsService.downloadEvents();
        // to this sequential to limit requests at geo service
        await promiseAllSequentially(newEvents, async newEvent => this.insertOrUpdateEvent(newEvent));
        await this.deleteEventsWhichAreInFutureButNotInRemoteIdList(newEvents.map(event => event.remoteId));
    }

    private async insertOrUpdateEvent(newEvent: Event) {
        if (!newEvent.remoteId) {
            this.logger.error(new Error("Fehler keine remote Id: " + newEvent.eventName));
            return;
        }

        try {
            let currentEvent = await this.repo.findOne({where: {remoteId: newEvent.remoteId}});

            if (currentEvent === null) {
                return await this.repo.save(await this.geoService.enrichEventWithGeoCoordinates(newEvent));
            }

            if (!currentEvent.equalsEventWithoutCoordinates(newEvent)) {
                newEvent.eventId = currentEvent.eventId;
                if (!currentEvent.locationInfosEquals(newEvent)) {
                    newEvent = await this.geoService.enrichEventWithGeoCoordinates(newEvent)
                } else {
                    newEvent.latitude = currentEvent.latitude;
                    newEvent.longitude = currentEvent.latitude;
                }

                return await this.repo.save(newEvent);
            }

        } catch (e) {
            this.logger.error(new AppException(e, "Fehler beim Insert/Update eines Events mit remote id: " + newEvent.remoteId));
        }
    }

    private async deleteEventsWhichAreInFutureButNotInRemoteIdList(remoteIds: string[]): Promise<Event[]> {
        if (remoteIds.length === 0) return [];

        let now = new Date();
        let eventsToDelete: Event[] = await this.find({
                where: {
                    remoteId: Not(In(remoteIds)),
                    startDate: MoreThan(now),
                    isPublic: true
                }
            }
        );

        return await this.repo.remove(eventsToDelete);
    }
}
