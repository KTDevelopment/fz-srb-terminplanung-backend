import {Controller, Get} from "@nestjs/common";
import {FcmService} from "./fcm.service";
import {MembersService} from "../ressources/members/members.service";
import {Auth} from "../auth/auth.decorator";
import {ROLE_ID_ADMIN} from "../ressources/roles/role.entity";
import {ApiTags} from "@nestjs/swagger";

@Auth(ROLE_ID_ADMIN)
@ApiTags('fcm')
@Controller('/api/v2/fcm')
export class FcmController {

    constructor(
        private readonly fcmService: FcmService,
        private readonly membersService: MembersService) {
    }

    @Get('test')
    async testFcm() {
        return this.fcmService.notifyAllAboutNewNewsletter(await this.membersService.find({relations: ['devices']}));
    }
}
