import {Body, Controller, Get, Post, UsePipes, ValidationPipe} from '@nestjs/common';
import {TransformInstanceToPlain} from "class-transformer";
import {MiscService} from "./misc.service";
import {AppStoreLinksDto} from "./model/AppStoreLinks.dto";
import {ApiTags} from "@nestjs/swagger";
import {DropBoxLinksDto} from "./model/DropBoxLinks.dto";
import {Auth} from "../../auth/auth.decorator";
import {ROLE_ID_ADMIN, ROLE_ID_MEMBER} from "../roles/role.entity";

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
                unsecured: {
                    appStoreLinks: '/fzSrbAppStoreLinks'
                },
                secured: {
                    dropboxLinks: '/dropBoxLinks'
                }
            }
        }
    }

    @Get('fzSrbAppStoreLinks')
    @TransformInstanceToPlain()
    async handleFzAppStoreLinks(): Promise<AppStoreLinksDto> {
        return this.miscService.getFzAppStoreLinks()
    }

    @Auth(ROLE_ID_ADMIN)
    @Post('fzSrbAppStoreLinks')
    @UsePipes(new ValidationPipe({ transform: true }))
    @TransformInstanceToPlain()
    async handlePostFzAppStoreLinks(@Body() newLinks: AppStoreLinksDto): Promise<AppStoreLinksDto> {
        return this.miscService.saveFzAppStoreLinks(newLinks)
    }

    @Auth(ROLE_ID_MEMBER)
    @Get('dropBoxLinks')
    @TransformInstanceToPlain()
    async handleGetDropBoxLinks(): Promise<DropBoxLinksDto> {
        return this.miscService.getDropBoxLinks()
    }

    @Auth(ROLE_ID_ADMIN)
    @Post('dropBoxLinks')
    @UsePipes(new ValidationPipe({ transform: true }))
    @TransformInstanceToPlain()
    async handlePostDropBoxLinks(@Body() newLinks: DropBoxLinksDto): Promise<DropBoxLinksDto> {
        return this.miscService.saveDropBoxLinks(newLinks)
    }
}
