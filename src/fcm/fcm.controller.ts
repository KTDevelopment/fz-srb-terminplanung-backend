import {Controller, Get} from "@nestjs/common";
import {FcmService} from "./fcm.service";
import {MembersService} from "../ressources/members/members.service";
import {EventsService} from "../ressources/events/events.service";
import {STATE__INVITATION_REQUEST_PENDING} from "../ressources/participations/participation-states/participation-state.entity";
import {Auth} from "../auth/auth.decorator";
import {ROLE_ID_ADMIN} from "../ressources/roles/role.entity";
import {ApiTags} from "@nestjs/swagger";

@Auth(ROLE_ID_ADMIN)
@ApiTags('fcm')
@Controller('/api/v2/fcm')
export class FcmController {

    constructor(
        private readonly fcmService: FcmService,
        private readonly membersService: MembersService,
        private readonly eventsService: EventsService) {
    }

    @Get('test')
    async testFcm() {
        return this.fcmService.notifyAllAboutNewNewsletter(await this.membersService.find({relations: ['devices']}));
    }

    @Get('test-foo')
    async testFcmFoo() {
        return this.fcmService.notifyPlannerAboutStateChange(
            await this.eventsService.findOne({eventId: 194}),
            [(await this.membersService.findOne({memberId: 1}, {relations: ['devices', "section"]}))],
            await this.membersService.findOne({memberId: 4}, {relations: ['devices', "section"]}),
            STATE__INVITATION_REQUEST_PENDING
        )
    }
}
