import {
    FcmPayload,
    TYPE_MEMBER_CHANGED_HIS_STATE,
    TYPE_NEW_NEWSLETTER,
    TYPE_PLANNER_CHANGED_MEMBER_STATE,
    TYPE_REMIND_MEMBER
} from "./models/FcmPayload";
import {BadRequestException, Injectable} from "@nestjs/common";
import {Member} from "../ressources/members/member.entity";
import {Event} from "../ressources/events/event.entity";
import {
    STATE__ATTEND,
    STATE__DO_NOT_ATTEND,
    STATE__INVITATION_REQUEST_PENDING,
    STATE__INVITATION_REQUEST_REJECTED,
    STATE__INVITED,
    STATE__NOT_INVITED
} from "../ressources/participations/participation-states/participation-state.entity";
import {ApplicationLogger} from "../logger/application-logger.service";

@Injectable()
export class FcmPayloadGenerator {

    constructor(private readonly logger: ApplicationLogger) {
        this.logger.setContext(FcmPayloadGenerator.name);
    }

    generatePayloadForRemindMember(planer: Member, event: Event, stateId: number): FcmPayload {
        try {
            return (new FcmPayload())
                .setTitle('Erinnerung für ' + event.eventName)
                .setMessage(FcmPayloadGenerator.generateMessageForRemindMember(planer, event, stateId))
                .setEventId(event.eventId + '')
                .setType(TYPE_REMIND_MEMBER);
        } catch (e) {
            this.logger.error("generatePayloadForRemindMemberFailed", e);
            throw e;
        }
    };

    generatePayloadForMemberChangedHisState(member: Member, event: Event, stateId: number) {
        try {
            return (new FcmPayload())
                .setTitle('Neuer Status für ' + member.getFullName())
                .setMessage(FcmPayloadGenerator.generateMessageForPlanerByState(member, event, stateId))
                .setEventId(event.eventId + '')
                .setType(TYPE_MEMBER_CHANGED_HIS_STATE);
        } catch (e) {
            this.logger.error("generatePayloadForMemberChangedHisStateFailed", e);
            throw e;
        }
    };

    generatePayloadForPlanerChangedMemberState(planer: Member, member: Member, event: Event, stateId: number) {
        try {
            return (new FcmPayload())
                .setTitle('Hey ' + member.firstName)
                .setMessage(FcmPayloadGenerator.generateMessageForMemberByState(planer, event, stateId))
                .setEventId(event.eventId + '')
                .setType(TYPE_PLANNER_CHANGED_MEMBER_STATE);
        } catch (e) {
            this.logger.error("generatePayloadForPlanerChangedMemberStateFailed", e);
            throw e;
        }
    };

    generatePayloadForNewNewsletter() {
        return (new FcmPayload())
            .setTitle('Der neue Newsletter ist verfügbar!')
            .setMessage('Jetzt anzeigen lassen.')
            .setType(TYPE_NEW_NEWSLETTER);
    }

    private static generateMessageForPlanerByState(member, event, stateId) {
        switch (stateId) {
            case STATE__ATTEND:
                return FcmPayloadGenerator.generateMessageForPlanerForAttend(member, event);
            case STATE__DO_NOT_ATTEND:
                return FcmPayloadGenerator.generateMessageForPlanerForDontAttend(member, event);
            case STATE__INVITATION_REQUEST_PENDING:
                return FcmPayloadGenerator.generateMessageForPlanerForInvitationRequestPending(member, event);
            default:
                throw new InvalidStateForMessageException(stateId, 'MessageForPlaner');
        }
    }

    private static generateMessageForMemberByState(planer, event, stateId) {
        switch (stateId) {
            case STATE__INVITED:
                return FcmPayloadGenerator.generateMessageForMemberForInvited(planer, event);
            case STATE__NOT_INVITED:
                return FcmPayloadGenerator.generateMessageForMemberForNotInvitedOrRejected(planer, event);
            case STATE__ATTEND: // planer betsätigt Invitation Request
                return FcmPayloadGenerator.generateMessageForMemberForAttend(planer, event);
            case STATE__INVITATION_REQUEST_REJECTED:
                return FcmPayloadGenerator.generateMessageForMemberForNotInvitedOrRejected(planer, event);
            default:
                throw new InvalidStateForMessageException(stateId, 'MessageForMember');
        }
    };

    private static generateMessageForRemindMember(planer, event, stateId) {
        switch (stateId) {
            case STATE__INVITED:
                return FcmPayloadGenerator.generateMessageForMemberForRemindInvited(planer, event);
            case STATE__ATTEND:
                return FcmPayloadGenerator.generateMessageForMemberRemindAttend(planer, event);
            default:
                throw new InvalidStateForMessageException(stateId, 'MessageForRemindMember');
        }
    };

    private static generateMessageForMemberRemindAttend(planer: Member, event: Event) {
        return planer.firstName + ' möchte dich daran erinnern, dass du zur Veranstaltung ' + event.eventName + ' zugesagt hast.'
    }

    private static generateMessageForMemberForRemindInvited(planer: Member, event: Event) {
        return planer.firstName + ' möchte dich daran erinnern, ihm eine Rückmeldung zur Veranstaltung ' + event.eventName + ' zugeben.'
    }

    private static generateMessageForPlanerForAttend(member: Member, event: Event) {
        return member.getFullName() + ' hat für die Veranstaltung ' + event.eventName + ' zugesagt.'
    }

    private static generateMessageForPlanerForDontAttend(member: Member, event: Event) {
        return member.getFullName() + ' hat für die Veranstaltung ' + event.eventName + ' abgesagt.'
    }

    private static generateMessageForPlanerForInvitationRequestPending(member: Member, event: Event) {
        return member.getFullName() + ' möchte an der Veranstaltung ' + event.eventName + ' teilnehmen.'
    }

//for member
    private static generateMessageForMemberForInvited(planer: Member, event: Event) {
        return planer.firstName + ' hat dich zur Veranstaltung ' + event.eventName + ' eingeladen.'
    }

    private static generateMessageForMemberForNotInvitedOrRejected(planer: Member, event: Event) {
        return planer.firstName + ' hat dich von der Veranstaltung ' + event.eventName + ' ausgeladen.'
    }

    private static generateMessageForMemberForAttend(planer: Member, event: Event) {
        //planer hat Anfrage bestätigt
        return planer.firstName + ' hat bestätigt, dass du an der Veranstaltung ' + event.eventName + ' teilnehmen kannst.'
    }
}

class InvalidStateForMessageException extends BadRequestException {
    constructor(stateId: number, messageType: string) {
        super('no ' + messageType + ' for state: ' + stateId);
    }
}
