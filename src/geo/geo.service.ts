import {HttpService, Injectable} from '@nestjs/common';
import {ConfigService} from "../config/config.service";
import {ApplicationLogger} from "../logger/application-logger.service";
import {Event} from "../ressources/events/event.entity";

@Injectable()
export class GeoService {

    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
        private readonly logger: ApplicationLogger
    ) {
        this.logger.setContext(GeoService.name)
    }

    async enrichEventWithGeoCoordinates(event: Event) {
        try {
            const url = `https://nominatim.openstreetmap.org/search?q=${event.address}+${event.postcode}+${event.town}&format=json&polygon=1&addressdetails=1`;
            const result = await this.httpService.get(url).toPromise();
            if (result.data.length > 0) {
                const first = result.data[0];
                event.latitude = first.lat;
                event.longitude = first.lon;
            }
        } catch (e) {
            this.logger.error('loading geo coordinates failed', e.stack);
        }

        return event;
    }
}
