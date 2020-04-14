import {EventsHandler, IEventHandler} from "@nestjs/cqrs";
import {SendFirebaseMessageEvent} from "./send-firebase-message.event";
import {FcmService} from "../fcm.service";
import {
    STATE__ATTEND,
    STATE__DO_NOT_ATTEND,
    STATE__HAS_NOT_PARTICIPATED,
    STATE__HAS_PARTICIPATED
} from "../../ressources/participations/participation-states/participation-state.entity";
import {MembersService} from "../../ressources/members/members.service";

@EventsHandler(SendFirebaseMessageEvent)
export class SendFirebaseMessageEventHandler implements IEventHandler<SendFirebaseMessageEvent> {
    constructor(
        private readonly fcmService: FcmService,
        private readonly membersService: MembersService,
    ) {
    }

    async handle(event: SendFirebaseMessageEvent) {
        if (SendFirebaseMessageEventHandler.isFCMNeeded(event)) {
            if (event.callingMember.isNotPrivileged()) {
                let receivers = await this.membersService.findPlannerOfMember(event.callingMember);
                return this.fcmService.notifyPlannerAboutStateChange(event.event, receivers, event.callingMember, event.newStateId);
            }
            if (event.changedMember.memberId !== event.callingMember.memberId) {
                return this.fcmService.notifyMemberThatHisStateChanged(event.event, event.changedMember, event.callingMember, event.newStateId);
            }
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
