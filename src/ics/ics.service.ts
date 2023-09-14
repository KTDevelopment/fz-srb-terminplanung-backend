import {Injectable} from '@nestjs/common';
import {Event} from "../ressources/events/event.entity";
import {plainToInstance} from "class-transformer";
import {ConfigService} from "../config/config.service";
import {ApplicationLogger} from "../logger/application-logger.service";
import {AppException} from "../_common/AppException";
import {DateTime} from "luxon";

const iCal = require('node-ical');

@Injectable()
export class IcsService {

    constructor(
        private readonly configService: ConfigService,
        private readonly logger: ApplicationLogger
    ) {
        this.logger.setContext(IcsService.name)
    }

    async downloadEvents(): Promise<Event[]> {
        const basicUrl = this.configService.config.ics.icsRootPath;
        const futureUrl = basicUrl + "&tribe-bar-date=" + DateTime.now().plus({month: 3}).toFormat("yyyy-MM-dd")
        return this.removeDuplicateEvents([
            ...this.convertEvents(await this.downloadFromUrl(basicUrl)),
            ...this.convertEvents(await this.downloadFromUrl(futureUrl))
        ])
    }

    private removeDuplicateEvents(events: Event[]) {
        return events.filter((value, index, self) =>
                index === self.findIndex((t) => (
                    t.remoteId === value.remoteId
                ))
        )
    }

    private convertEvents(rawIcsEvents: any) {
        const newEvents = [];
        for (let i in rawIcsEvents) {
            if (rawIcsEvents.hasOwnProperty(i) && rawIcsEvents[i].type === 'VEVENT') {
                newEvents.push(IcsService.createEvent(rawIcsEvents[i]));
            }
        }
        return newEvents;
    }

    private async downloadFromUrl(url: string) {
        return new Promise((resolve) => {
            iCal.fromURL(url, {}, (err, data) => {
                if (!err) {
                    resolve(data)
                } else {
                    this.logger.error(new AppException(err, "Fehler beim Download der .ics Datei von " + url));
                    resolve([]);
                }
            });
        })
    }

    private static createEvent(raw: any) {
        return plainToInstance(Event, {
            remoteId: raw.uid,
            startDate: new Date(raw.start),
            endDate: new Date(raw.end),
            summary: raw.summary || '',
            description: raw.description || '',
            eventName: raw.summary || '',
            ...IcsService.getLocationDetails(raw.location),
            dress: '',
            participatingGroup: '',
            category: IcsService.determineCategory(raw.categories),
            longitude: 0,
            latitude: 0,
            isPublic: true
        });
    }

    private static getLocationDetails(locationString: string | null | undefined) {
        if (!locationString) return {
            location: '',
            address: '',
            town: '',
            postcode: 0,
        }

        const split = locationString.split(',');

        if (split[3] && !isNaN(parseInt(split[3].trim()))) {
            return {
                location: split[0] ? split[0].trim() : '',
                address: split[1] ? split[1].trim() : '',
                town: split[2] ? split[2].trim() : '',
                postcode: split[3] ? parseInt(split[3].trim()) : 0,
            }
        }

        if (split[0] === "BANDHAUS") {
            return {
                location: split[0] ? split[0].trim() : '',
                address: split[1] ? split[1].trim() : '',
                town: split[2] ? split[2].trim() : '',
                postcode: split[4] ? parseInt(split[4].trim()) : 0,
            }
        }

        return {
            location: locationString,
            address: '',
            town: '',
            postcode: 0,
        }
    }

    private static determineCategory(catsFromWebsite: string[] | null | undefined): string {
        if (!catsFromWebsite || catsFromWebsite.length === 0) return '';

        if (catsFromWebsite.length === 1) return catsFromWebsite[0];

        if (catsFromWebsite.includes('HIGHLIGHT')) {
            return 'HIGHLIGHT';
        }

        return catsFromWebsite[0]
    }
}
