import {Injectable} from '@nestjs/common';
import {AppStoreLinksDto} from "./model/AppStoreLinks.dto";
import {plainToClass} from "class-transformer";
import {ConfigService} from "../../config/config.service";

@Injectable()
export class MiscService {

    constructor(private readonly configService: ConfigService) {
    }

    getFzAppStoreLinks(): AppStoreLinksDto {
        const appStoreLinks = this.configService.config.appStoreLinks;

        return plainToClass(AppStoreLinksDto, {
            iosLink: appStoreLinks.ios,
            androidLink: appStoreLinks.android
        });
    }
}
