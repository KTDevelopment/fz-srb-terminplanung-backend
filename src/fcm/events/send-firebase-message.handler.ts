import {EventsHandler, IEventHandler} from "@nestjs/cqrs";
import {SendFirebaseMessageEvent} from "./send-firebase-message.event";
import {DeviceSpecificFcmResponse, FcmService} from "../fcm.service";
import {
    STATE__ATTEND,
    STATE__DO_NOT_ATTEND,
    STATE__HAS_NOT_PARTICIPATED,
    STATE__HAS_PARTICIPATED
} from "../../ressources/participations/participation-states/participation-state.entity";
import {MembersService} from "../../ressources/members/members.service";
import {ApplicationLogger} from "../../logger/application-logger.service";
import {Maybe} from "purify-ts";

@EventsHandler(SendFirebaseMessageEvent)
export class SendFirebaseMessageEventHandler implements IEventHandler<SendFirebaseMessageEvent> {
    constructor(
        private readonly fcmService: FcmService,
        private readonly membersService: MembersService,
        private readonly logger: ApplicationLogger
    ) {
        this.logger.setContext(SendFirebaseMessageEventHandler.name);
    }

    async handle(event: SendFirebaseMessageEvent): Promise<Maybe<DeviceSpecificFcmResponse>> {
        this.logger.debug(`firebase event received: ${JSON.stringify(event)}`)
        try {
            if (SendFirebaseMessageEventHandler.isFCMNeeded(event)) {
                if (event.callingMember.isNotPrivileged()) {
                    this.logger.debug(`firebase event from member for planner`)
                    let receivers = await this.membersService.findPlannerOfMember(event.callingMember);
                    return await this.fcmService.notifyPlannerAboutStateChange(event.event, receivers, event.callingMember, event.newStateId);
                }
                if (event.changedMember.memberId !== event.callingMember.memberId) {
                    this.logger.debug(`firebase event from planner for member`)
                    return await this.fcmService.notifyMemberThatHisStateChanged(event.event, event.changedMember, event.callingMember, event.newStateId);
                }
                this.logger.debug(`firebase event not categorized`)
            } else {
                this.logger.debug(`firebase sending ist not needed`)
            }
        } catch (e) {
            this.logger.error(e);
        }
    }

    private static isFCMNeeded(event: SendFirebaseMessageEvent) {
        const {newStateId, callingMember, changedMember} = event;
        // Nachricht über FCM wird NICHT verschickt wenn
        // status 6 oder 7 verteilt wird
        // oder status 2 oder 3 von einem Planer, wenn ein Mitglied keine Reg_ids hat

        if (newStateId === STATE__HAS_PARTICIPATED || newStateId === STATE__HAS_NOT_PARTICIPATED) {
            return false;
        }

        return !(SendFirebaseMessageEventHandler.isAttendOrNotAttend(newStateId) && callingMember.isPrivileged() && changedMember.devices.length === 0);
    }

    private static isAttendOrNotAttend(newStateId: number) {
        return (newStateId === STATE__DO_NOT_ATTEND || newStateId === STATE__ATTEND)
    }
}
