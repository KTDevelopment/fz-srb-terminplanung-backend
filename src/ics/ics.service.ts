import {Injectable} from '@nestjs/common';
import {Event} from "../ressources/events/event.entity";
import {plainToClass} from "class-transformer";
import {SeasonsDeterminator} from "../_common/SeasonsDeterminator";
import {ConfigService} from "../config/config.service";
import {ApplicationLogger} from "../logger/application-logger.service";

const iCal = require('node-ical');

@Injectable()
export class IcsService {

    constructor(
        private readonly configService: ConfigService,
        private readonly logger: ApplicationLogger
    ) {
        this.logger.setContext(IcsService.name)
    }

    downloadEvents(): Promise<Event[]> {
        const url = this.configService.config.ics.icsRootPath;
        return new Promise((resolve, reject) => {
            const newEvents = [];
            iCal.fromURL(url, {}, (err, data) => {
                if (!err) {
                    for (let i in data) {
                        if (data.hasOwnProperty(i) && data[i].type === 'VEVENT') {
                            newEvents.push(IcsService.createEvent(data[i]));
                        }
                    }
                    resolve(newEvents)
                } else {
                    this.logger.error("Fehler beim Download der .ics Datei von " + url, err.stack);
                    reject(err);
                }
            });
        })
    }

    private static createEvent(raw: any) {
        return plainToClass(Event, {
            remoteId: raw.uid,
            startDate: IcsService.calculateDatePayingAttentionOnWinterTime(new Date(raw.start)),
            endDate: IcsService.calculateDatePayingAttentionOnWinterTime(new Date(raw.end)),
            summary: raw.summary || '',
            description: raw.description || '',
            eventName: raw.summary || '',
            location: raw.location ? raw.location.split(',')[0].trim() : '',
            address: raw.location ? raw.location.split(',')[1].trim() : '',
            town: raw.location ? raw.location.split(',')[2].trim() : '',
            postcode: raw.location ? parseInt(raw.location.split(',')[3].trim()) : '',
            dress: '',
            participatingGroup: '',
            category: IcsService.determineCategory(raw.categories),
            longitude: 0,
            latitude: 0,
            isPublic: true
        });
    }

    private static calculateDatePayingAttentionOnWinterTime(date) {
        if (SeasonsDeterminator.isInWinterTime(date)) {
            let millisFormPlusOneHour = date.getTime() + (60 * 60 * 1000); // eine Stunde addieren, weil der Zeitstempel nicht in WinterZeit ist
            return new Date(millisFormPlusOneHour);
        }
        return date;
    }

    private static determineCategory(catsFromWebsite: string[]): string {
        if (catsFromWebsite.length === 0) return '';

        if (catsFromWebsite.length === 1) return catsFromWebsite[0];

        if (catsFromWebsite.includes('HIGHLIGHT')) {
            return 'HIGHLIGHT';
        }

        return catsFromWebsite[0]
    }
}
