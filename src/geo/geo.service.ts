import {Injectable} from '@nestjs/common';
import {ConfigService} from "../config/config.service";
import {ApplicationLogger} from "../logger/application-logger.service";
import {Event} from "../ressources/events/event.entity";
import {AppException} from "../_common/AppException";
import {HttpService} from "@nestjs/axios";
import {firstValueFrom} from "rxjs";

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
        if (!event.address || !event.postcode || !event.town) {
            return event;
        }

        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(event.address)}+${event.postcode}+${encodeURIComponent(event.town)}&format=json&polygon=1&addressdetails=1`;
        try {
            const result = await firstValueFrom(this.httpService.get(url));
            if (result.data.length > 0) {
                const first = result.data[0];
                event.latitude = first.lat;
                event.longitude = first.lon;
            }
        } catch (e) {
            this.logger.error(new AppException(e, `loading geo coordinates from ${url} failed`));
        }

        return event;
    }
}
