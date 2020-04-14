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
                    for (let k in data) {
                        if (data.hasOwnProperty(k)) {
                            newEvents.push(IcsService.createEvent(data[k]));
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

    private static createEvent(rawEvent: any) {
        return plainToClass(Event, {
            wpId: rawEvent.wpid,
            startDate: IcsService.calculateDatePayingAttentionOnWinterTime(new Date(rawEvent.start)),
            endDate: IcsService.calculateDatePayingAttentionOnWinterTime(new Date(rawEvent.end)),
            summary: rawEvent.summary || '',
            description: rawEvent.description || '',
            eventName: rawEvent.eventname || '',
            location: rawEvent.location || '',
            address: rawEvent.adress || '',
            postcode: parseInt(rawEvent.postcode) || 0,
            town: rawEvent.town || '',
            dress: rawEvent.kleidung || '',
            participatingGroup: rawEvent.bereich || '',
            category: rawEvent.kategorie || '',
            longitude: parseFloat(rawEvent.longitude) || 0,
            latitude: parseFloat(rawEvent.latitude) || 0,
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
}
