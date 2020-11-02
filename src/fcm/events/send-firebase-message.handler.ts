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
import * as Sentry from "@sentry/node";
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
        try {
            if (SendFirebaseMessageEventHandler.isFCMNeeded(event)) {
                if (event.callingMember.isNotPrivileged()) {
                    let receivers = await this.membersService.findPlannerOfMember(event.callingMember);
                    return await this.fcmService.notifyPlannerAboutStateChange(event.event, receivers, event.callingMember, event.newStateId);
                }
                if (event.changedMember.memberId !== event.callingMember.memberId) {
                    return await this.fcmService.notifyMemberThatHisStateChanged(event.event, event.changedMember, event.callingMember, event.newStateId);
                }
            }
        } catch (e) {
            this.logger.error(e.message, e.stack);
            Sentry.captureException(e)
        }
    }

    private static isFCMNeeded(event: SendFirebaseMessageEvent) {
        const {newStateId, callingMember} = event;
        // Nachricht über FCM wird NICHT verschickt wenn
        // status 6 oder 7 verteilt wird
        // oder status 2 oder 3 von einem Planer, das solte nur geschehen wenn ein Mitglied keine Reg_ids hat und deswegen brauch auch kein FCM gestartet werden

        if (newStateId === STATE__HAS_PARTICIPATED || newStateId === STATE__HAS_NOT_PARTICIPATED) {
            return false;
        }

        return !(SendFirebaseMessageEventHandler.isAttendOrNotAttend(newStateId) && callingMember.isPrivileged());
    }

    private static isAttendOrNotAttend(newStateId: number) {
        return (newStateId === STATE__DO_NOT_ATTEND || newStateId === STATE__ATTEND)
    }
}
