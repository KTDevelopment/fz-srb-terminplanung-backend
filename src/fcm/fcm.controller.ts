import {Body, Controller, Get, HttpCode, HttpStatus, Post, Request} from "@nestjs/common";
import {FcmService} from "./fcm.service";
import {MembersService} from "../ressources/members/members.service";
import {Auth} from "../auth/auth.decorator";
import {ROLE_ID_ADMIN} from "../ressources/roles/role.entity";
import {ApiTags} from "@nestjs/swagger";
import {validateEntity} from "../_common/EntityValidator";
import {plainToInstance} from "class-transformer";
import {RemindParticipantsDTO} from "./models/RemindParticipantsDTO";
import {DeepPartial} from "typeorm";
import {EventsService} from "../ressources/events/events.service";
import {promiseAllSequentially} from "../_common/promiseAllSequentially";
import {Roles} from "../ressources/roles/roles.decorator";

@Auth()
@ApiTags('fcm')
@Controller('/api/v2/fcm')
export class FcmController {

    constructor(
        private readonly fcmService: FcmService,
        private readonly membersService: MembersService,
        private readonly eventsService: EventsService,
    ) {
    }

    @Roles(ROLE_ID_ADMIN)
    @Get('test')
    async testFcm() {
        return this.fcmService.notifyAllAboutNewNewsletter(await this.membersService.find({relations: ['devices']}));
    }

    @Post('remindParticipators')
    @HttpCode(HttpStatus.OK)
    async remindParticipators(@Request() req, @Body() dtoLike: DeepPartial<RemindParticipantsDTO>) {
        const {remindRequests} = await validateEntity(plainToInstance(RemindParticipantsDTO, dtoLike));

        await promiseAllSequentially(remindRequests, async it => {
            const member = await this.membersService.findDetailedMember(it.memberId)
            const event = await this.eventsService.findOneOrFail({where: {eventId: it.eventId}})

            await this.fcmService.remindParticipator(event, req.user, member, it.stateId)
        })

        return {
            remind: "successful"
        }
    }
}
