import {Controller, Get} from '@nestjs/common';
import {TransformClassToPlain} from "class-transformer";
import {MiscService} from "./misc.service";
import {AppStoreLinksDto} from "./model/AppStoreLinks.dto";
import {ApiTags} from "@nestjs/swagger";

@ApiTags('misc')
@Controller('api/v2/misc')
export class MiscController {

    constructor(private readonly miscService: MiscService) {
    }

    @Get()
    foo() {
        return {
            description: 'misc stuff',
            content: {
                appStoreLinks: '/fzSrbAppStoreLinks'
            }
        }
    }

    @Get('fzSrbAppStoreLinks')
    @TransformClassToPlain()
    async handleFzAppStoreLinks(): Promise<AppStoreLinksDto> {
        return this.miscService.getFzAppStoreLinks()
    }
}
